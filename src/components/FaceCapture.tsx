import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from '@emotion/styled';
import Webcam from 'react-webcam';
import { isMobile } from 'react-device-detect';
// 임시로 react-image-crop 관련 기능을 제거하여 빌드 오류 해결
// import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
// import 'react-image-crop/dist/ReactCrop.css';

interface FaceCaptureProps {
  onCapture: (imageSrc: string) => void;
  isLoading?: boolean;
}

// 이미지 크롭 함수 - 크롭된 이미지를 base64 문자열로 반환
function getCroppedImg(image: HTMLImageElement, cropData: { 
  scale: number, 
  translateX: number, 
  translateY: number, 
  containerSize: number 
}): Promise<string> {
  const { scale, translateX, translateY, containerSize } = cropData;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context is not available');
  }

  // 결과 이미지 크기 설정 (정사각형)
  const outputSize = containerSize;
  canvas.width = outputSize;
  canvas.height = outputSize;

  // 이미지의 원래 크기 가져오기
  const imgWidth = image.naturalWidth;
  const imgHeight = image.naturalHeight;

  // 이미지 중심점 계산 - 스케일과 이동을 고려한 좌표
  // 이미지가 중앙에 위치하도록 좌표를 조정
  const centerX = imgWidth / 2;
  const centerY = imgHeight / 2;
  
  // 크롭할 영역 계산 - 중심에서의 오프셋 계산
  const sourceSize = containerSize / scale;
  const halfSourceSize = sourceSize / 2;
  
  // translateX/Y는 사용자가 드래그한 위치를 나타냄
  // 이미지를 반대 방향으로 이동시켜야 하므로 부호를 반대로 함
  const offsetX = -translateX / scale;
  const offsetY = -translateY / scale;
  
  // 최종 소스 좌표 계산 (이미지 중심에서 오프셋 적용)
  const sourceX = centerX - halfSourceSize + offsetX;
  const sourceY = centerY - halfSourceSize + offsetY;

  // 캔버스 배경을 검정색으로 설정 (투명 배경을 방지)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, outputSize, outputSize);

  // 이미지를 캔버스에 그리기
  ctx.drawImage(
    image,
    sourceX, 
    sourceY, 
    sourceSize, 
    sourceSize,
    0, 
    0, 
    outputSize, 
    outputSize
  );

  // 디버깅을 위한 로그
  console.log('Crop params:', {
    imgWidth, imgHeight,
    scale, translateX, translateY,
    sourceX, sourceY, sourceSize,
    outputSize
  });

  // 고품질 이미지로 반환
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Canvas is empty');
      }
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
    }, 'image/jpeg', 0.95); // 95% 품질로 압축
  });
}

const FaceCapture: React.FC<FaceCaptureProps> = ({ onCapture, isLoading = false }) => {
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<'user' | 'environment'>('user'); // front or back camera
  const [error, setError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<boolean>(true); // 기본값을 업로드 모드로 변경
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true); // 초기 로딩 상태 추가
  const [videoShown, setVideoShown] = useState<boolean>(false); // 비디오 표시 상태 추가
  
  // 이미지 크롭 관련 상태
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  
  // 새로운 이미지 조작 상태
  const [scale, setScale] = useState<number>(1);
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 화면 크기에 따른 비디오 설정
  const videoConstraints = {
    width: isMobile ? 720 : 640,
    height: isMobile ? 1280 : 480,
    facingMode: cameraType,
  };
  
  // 이미지 로드 시 초기 위치 설정
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const container = cropContainerRef.current;
    
    if (img && container) {
      // 이미지와 컨테이너의 비율 계산
      const containerSize = container.clientWidth;
      const imageAspect = img.naturalWidth / img.naturalHeight;
      
      // 초기 스케일 계산 (이미지가 컨테이너에 맞도록)
      let newScale = 1;
      if (imageAspect > 1) {
        // 이미지가 가로로 더 긴 경우
        newScale = containerSize / (img.naturalHeight * imageAspect);
      } else {
        // 이미지가 세로로 더 긴 경우
        newScale = containerSize / img.naturalHeight;
      }
      
      // 이미지가 프레임을 더 많이 채우도록 확대
      // 1.2배로 줄여서 이미지가 크롭 영역을 충분히 채우면서도 너무 확대되지 않도록 함
      newScale = Math.min(newScale * 1.2, 3); // 1.2배 확대, 최대 3배까지
      
      console.log('Image loaded:', {
        imageWidth: img.naturalWidth,
        imageHeight: img.naturalHeight,
        containerSize,
        imageAspect,
        initialScale: newScale
      });
      
      // 스케일 설정 및 초기 위치를 0으로 설정 (중앙 정렬)
      setScale(newScale);
      setTranslateX(0);
      setTranslateY(0);
    }
  }, []);
  
  // 드래그 시작 핸들러
  const handleDragStart = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    
    // 마우스 또는 터치 이벤트의 좌표 가져오기
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragStart({ x: clientX - translateX, y: clientY - translateY });
  }, [translateX, translateY]);
  
  // 드래그 중 핸들러
  const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (isDragging && dragStart) {
      e.preventDefault();
      
      // 마우스 또는 터치 이벤트의 좌표 가져오기
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      setTranslateX(clientX - dragStart.x);
      setTranslateY(clientY - dragStart.y);
    }
  }, [isDragging, dragStart]);
  
  // 드래그 종료 핸들러
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // 크롭 영역 외부 이벤트 리스너 설정
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDrag(e);
    const handleTouchMove = (e: TouchEvent) => handleDrag(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleDrag, handleDragEnd]);
  
  // 확대/축소 핸들러
  const handleScaleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    setScale(newScale);
  }, []);
  
  // 크롭 완료 처리
  const handleCropComplete = useCallback(async () => {
    if (imgRef.current && cropContainerRef.current) {
      try {
        const containerSize = cropContainerRef.current.clientWidth;
        const cropData = {
          scale,
          translateX,
          translateY,
          containerSize
        };
        
        const croppedImageUrl = await getCroppedImg(imgRef.current, cropData);
        setCapturedImage(croppedImageUrl);
        setIsCropping(false);
      } catch (err) {
        console.error('Crop error:', err);
        setError('이미지 크롭 중 오류가 발생했습니다.');
      }
    } else {
      setError('이미지 참조를 찾을 수 없습니다.');
    }
  }, [scale, translateX, translateY]);
  
  // 크롭 취소
  const handleCancelCrop = useCallback(() => {
    setIsCropping(false);
    // 원본 이미지로 돌아가기
    if (originalImage) {
      setCapturedImage(originalImage);
    }
  }, [originalImage]);
  
  // 카메라 스트림 초기화 함수
  const initializeCamera = useCallback(() => {
    setIsInitializing(true);
    setIsCameraReady(false);
    
    // 비디오 숨김 처리 제거 - 항상 표시
    // setVideoShown(false);
    
    if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.srcObject) {
      try {
        const tracks = (webcamRef.current.video.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      } catch (err) {
        console.error('카메라 스트림 중지 오류:', err);
      }
    }
    
    // 새로운 카메라 스트림 설정 시도
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: cameraType,
        width: { ideal: videoConstraints.width },
        height: { ideal: videoConstraints.height }
      } 
    })
    .then(() => {
      console.log('카메라 스트림 초기화 성공');
      setHasCameraPermission(true);
      setError(null);
      // 바로 이미지가 표시되도록 설정
      setVideoShown(true);
    })
    .catch((err) => {
      console.error('카메라 초기화 오류:', err);
      setHasCameraPermission(false);
      setError('카메라에 접근할 수 없습니다. 권한을 확인하거나 이미지 업로드를 이용해주세요.');
      setUploadMode(true);
    })
    .finally(() => {
      setIsInitializing(false);
    });
  }, [cameraType, videoConstraints.width, videoConstraints.height]);
  
  // 컴포넌트 마운트 시 카메라 권한 확인
  useEffect(() => {
    if (!uploadMode) {
      initializeCamera();
    } else {
      setIsInitializing(false);
    }
  }, [uploadMode, initializeCamera]);
  
  // 카메라 타입이 변경될 때마다 스트림 재초기화
  useEffect(() => {
    if (!uploadMode && hasCameraPermission) {
      initializeCamera();
    }
  }, [cameraType, uploadMode, hasCameraPermission, initializeCamera]);
  
  // 웹캠이 준비되었을 때 호출되는 함수
  const handleUserMedia = useCallback(() => {
    console.log('웹캠 준비 완료');
    setIsCameraReady(true);
    setError(null);
    setIsInitializing(false);
    
    // 비디오 표시 즉시 설정 (지연 없이)
    setVideoShown(true);
  }, []);
  
  // 웹캠 에러 처리
  const handleUserMediaError = useCallback((err: string | DOMException) => {
    console.error('Webcam error:', err);
    setError('카메라에 접근할 수 없습니다. 권한을 확인하거나 이미지 업로드를 이용해주세요.');
    setIsCameraReady(false);
    setUploadMode(true); // 에러 발생 시 업로드 모드로 전환
    setIsInitializing(false);
  }, []);
  
  // 사진 찍기
  const handleCapture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
      } else {
        setError('사진을 촬영할 수 없습니다. 다시 시도하거나 이미지 업로드를 이용해주세요.');
      }
    }
  }, [webcamRef]);
  
  // 사진 다시 찍기 (이제 resetImage로 리네이밍)
  const resetImage = useCallback(() => {
    setCapturedImage(null);
    setOriginalImage(null);
    setIsCropping(false);
    
    if (!uploadMode && webcamRef.current) {
      // 카메라 스트림 재설정
      initializeCamera();
    }
  }, [uploadMode, initializeCamera]);
  
  // 카메라 전환 (전면/후면)
  const toggleCamera = useCallback(() => {
    setCameraType((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);
  
  // 확인 (분석 시작)
  const handleConfirm = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);

  // 촬영/업로드 모드 전환
  const toggleUploadMode = useCallback(() => {
    const newUploadMode = !uploadMode;
    setUploadMode(newUploadMode);
    setCapturedImage(null);
    setOriginalImage(null);
    setIsCropping(false);
    
    // 카메라 모드로 전환 시 카메라 초기화 즉시 수행
    if (!newUploadMode) {
      console.log("카메라 모드로 전환: 카메라 초기화");
      setTimeout(() => initializeCamera(), 100); // 약간의 지연으로 상태 업데이트 보장
    }
  }, [uploadMode, initializeCamera]);
  
  // 파일 업로드 처리
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const imageResult = reader.result as string;
        setCapturedImage(imageResult);
        setOriginalImage(imageResult); // 원본 이미지 저장
        setIsCropping(true); // 크롭 모드 활성화
      };
      
      reader.onerror = () => {
        setError('파일을 읽는 중 오류가 발생했습니다.');
      };
      
      reader.readAsDataURL(file);
    }
  }, []);
  
  // 파일 업로드 버튼 클릭
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, [fileInputRef]);
  
  // 이미지 크롭 버튼 클릭
  const handleCropClick = useCallback(() => {
    if (capturedImage) {
      setOriginalImage(capturedImage);
      setIsCropping(true);
    }
  }, [capturedImage]);
  
  return (
    <Container>
      <Title>AI 관상 분석</Title>
      <SubTitle>
        {uploadMode 
          ? '얼굴 사진을 업로드하여 AI 관상 분석을 받아보세요' 
          : '얼굴 사진을 찍어 AI 관상 분석을 받아보세요'}
      </SubTitle>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Content>
        {uploadMode ? (
          <UploadContainer>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
            
            {capturedImage && !isCropping ? (
              <SmallImageContainer>
                <CapturedImage src={capturedImage} alt="업로드된 이미지" />
                <CloseButton onClick={resetImage}>✕</CloseButton>
                <EditButton onClick={handleCropClick}>✎</EditButton>
              </SmallImageContainer>
            ) : isCropping && originalImage ? (
              <CropContainer>
                {/* 정사각형 크롭 영역 */}
                <SquareCropArea 
                  ref={cropContainerRef}
                  onMouseDown={handleDragStart}
                  onTouchStart={handleDragStart}
                >
                  <CropImageWrapper
                    style={{
                      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
                      cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                  >
                    <img
                      ref={imgRef}
                      alt="얼굴 크롭"
                      src={originalImage}
                      onLoad={onImageLoad}
                      style={{ 
                        width: '100%',
                        height: 'auto',
                        transformOrigin: 'center',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                      }}
                      draggable="false"
                    />
                  </CropImageWrapper>
                  
                  {/* 크롭 영역 가이드 원 */}
                  <CropCircleOverlay />
                </SquareCropArea>
                
                {/* 확대/축소 슬라이더 */}
                <ZoomControl>
                  <ZoomIcon>🔍-</ZoomIcon>
                  <ZoomSlider 
                    type="range" 
                    min="0.5" 
                    max="3" 
                    step="0.01" 
                    value={scale}
                    onChange={handleScaleChange}
                  />
                  <ZoomIcon>+🔍</ZoomIcon>
                </ZoomControl>
                
                <CropInstructions>
                  <strong>얼굴을 원 안에 맞추세요:</strong><br />
                  이미지를 드래그하여 위치를 조정하고, 슬라이더로 확대/축소하세요.<br />
                  얼굴 전체가 잘 보이도록 중앙에 맞춰주세요.
                </CropInstructions>
                
                <CropButtonGroup>
                  <CancelCropButton onClick={handleCancelCrop}>
                    취소
                  </CancelCropButton>
                  <ConfirmCropButton onClick={handleCropComplete}>
                    이 이미지 사용하기
                  </ConfirmCropButton>
                </CropButtonGroup>
              </CropContainer>
            ) : (
              <UploadArea onClick={handleUploadClick}>
                <UploadIcon>📷</UploadIcon>
                <UploadText>클릭하여 이미지 업로드</UploadText>
                <UploadSubText>JPG, PNG 형식 지원</UploadSubText>
              </UploadArea>
            )}
          </UploadContainer>
        ) : (
          <>
            {capturedImage ? (
              <SmallImageContainer>
                <CapturedImage src={capturedImage} alt="촬영된 얼굴" />
                <CloseButton onClick={resetImage}>✕</CloseButton>
                <EditButton onClick={handleCropClick}>✎</EditButton>
              </SmallImageContainer>
            ) : (
              <SmallWebcamContainer>
                {(isInitializing || !isCameraReady) && !error && (
                  <LoadingOverlay>
                    <LoadingSpinner />
                    <LoadingMessage>카메라 로딩 중...</LoadingMessage>
                    <LoadingHint>카메라 권한을 요청하면 '허용'을 눌러주세요</LoadingHint>
                  </LoadingOverlay>
                )}
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  videoConstraints={videoConstraints}
                  screenshotFormat="image/jpeg"
                  onUserMedia={handleUserMedia}
                  onUserMediaError={handleUserMediaError}
                  mirrored={cameraType === 'user'}
                  style={{
                    display: 'block', // 항상 표시
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover', // 웹캠은 cover 유지
                    borderRadius: '12px',
                    opacity: videoShown ? 1 : 0,
                    transition: 'opacity 0.2s ease', // 트랜지션 시간 단축
                  }}
                />
                {isCameraReady && !capturedImage && (
                  <CaptureHintOverlay>
                    <CaptureHintText>아래 '사진 촬영' 버튼을 눌러 사진을 찍으세요</CaptureHintText>
                  </CaptureHintOverlay>
                )}
              </SmallWebcamContainer>
            )}
          </>
        )}
      </Content>
      
      <ButtonContainer>
        {!isCropping && (
          <ModeToggleButtons>
            <ModeButton 
              active={uploadMode} 
              onClick={() => {
                if (!uploadMode) toggleUploadMode();
              }}
              disabled={isLoading}
            >
              🖼️ 이미지 업로드
            </ModeButton>
            
            <ModeButton 
              active={!uploadMode} 
              onClick={() => {
                if (uploadMode) toggleUploadMode();
              }}
              disabled={isLoading || (!uploadMode && !hasCameraPermission)}
            >
              📸 카메라 촬영
            </ModeButton>
          </ModeToggleButtons>
        )}
        
        {!capturedImage && !isCropping ? (
          <>
            {!uploadMode && (
              <ButtonGroup>
                <CameraButton onClick={toggleCamera} disabled={!isCameraReady || isLoading}>
                  📱 카메라 전환
                </CameraButton>
                <CaptureButton 
                  onClick={handleCapture} 
                  disabled={!isCameraReady || isLoading}
                  pulse={isCameraReady && !isLoading}
                >
                  📸 사진 촬영
                </CaptureButton>
              </ButtonGroup>
            )}
            
            {uploadMode && (
              <UploadButton 
                onClick={handleUploadClick} 
                disabled={isLoading}
              >
                📂 이미지 선택
              </UploadButton>
            )}
          </>
        ) : isCropping ? (
          null // 크롭 버튼은 CropContainer 내부에 있음
        ) : (
          <ConfirmButton onClick={handleConfirm} disabled={isLoading} fullWidth>
            {isLoading ? '분석 중...' : '확인'}
          </ConfirmButton>
        )}
      </ButtonContainer>
      
      <PrivacyNote>
        * 촬영 또는 업로드한 이미지는 분석 목적으로만 사용되며, 서버에 영구 저장되지 않습니다.
      </PrivacyNote>
    </Container>
  );
};

// 새로 추가된 스타일 컴포넌트
const SquareCropArea = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  height: 0;
  padding-bottom: 100%; /* 정사각형 */
  margin: 0 auto;
  overflow: hidden;
  background-color: #f0f0f0;
  border-radius: 12px;
  touch-action: none; /* 터치 액션 방지 */
`;

const CropImageWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform; /* 성능 최적화 */
  transition: transform 0.05s ease-out; /* 드래그 시 부드러운 효과 */
`;

const CropCircleOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    content: '';
    width: 96%;
    height: 96%;
    border: 2px dashed rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.3);
  }
  
  &::before {
    content: '+';
    position: absolute;
    color: white;
    font-size: 1.5rem;
    font-weight: 300;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
    z-index: 1;
  }
`;

const ZoomControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 300px;
  margin: 1rem auto 0.5rem;
  padding: 0 0.5rem;
`;

const ZoomIcon = styled.span`
  font-size: 1rem;
  color: #4a5568;
`;

const ZoomSlider = styled.input`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #cbd5e0;
  outline: none;
  transition: background 0.2s;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #6b46c1;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: #553c9a;
      transform: scale(1.1);
    }
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border: none;
    border-radius: 50%;
    background: #6b46c1;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: #553c9a;
      transform: scale(1.1);
    }
  }
`;

// 기존 스타일 컴포넌트 (변경되지 않은 부분은 생략)
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const SubTitle = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Content = styled.div`
  width: 100%;
  margin-bottom: 1.5rem;
`;

// 기존 큰 웹캠 컨테이너 대신 작은 크기로 조정
const SmallWebcamContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 360px;
  height: 0;
  padding-bottom: 100%; /* 4:3 비율에서 1:1 정사각형으로 변경 */
  overflow: hidden;
  border-radius: 12px;
  background-color: #000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin: 0 auto;
`;

// 로딩 오버레이 추가
const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 5;
  border-radius: 12px;
`;

// 로딩 스피너 추가
const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingMessage = styled.div`
  color: white;
  font-size: 1.2rem;
  font-weight: 500;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const LoadingHint = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  text-align: center;
  max-width: 80%;
`;

// 촬영 힌트 오버레이 추가
const CaptureHintOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%);
  z-index: 3;
`;

const CaptureHintText = styled.div`
  color: white;
  font-size: 0.9rem;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

// 작은 이미지 컨테이너로 대체
const SmallImageContainer = styled.div`
  width: 100%;
  max-width: 360px;
  height: 0;
  padding-bottom: 100%; /* 4:3 비율에서 1:1 정사각형으로 변경 */
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin: 0 auto;
`;

const CapturedImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain; /* cover 대신 contain으로 변경하여 비율 유지 */
  border-radius: 12px;
  background-color: #000; /* 배경 추가 */
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 360px;
  margin-bottom: 1.5rem;
`;

// 모드 선택 버튼 그룹
const ModeToggleButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;
`;

const ModeButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 0.8rem 0.5rem;
  background-color: ${props => props.active ? '#6b46c1' : '#e2e8f0'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? '#553c9a' : '#cbd5e0'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CameraButton = styled.button`
  flex: 1;
  padding: 0.8rem;
  background-color: #2d3748;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #4a5568;
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

// 사진 촬영 버튼 - 눈에 띄는 애니메이션 추가
const CaptureButton = styled.button<{ pulse?: boolean }>`
  padding: 1rem;
  background-color: #6b46c1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  box-shadow: ${props => props.pulse ? '0 0 0 0 rgba(107, 70, 193, 0.7)' : 'none'};
  animation: ${props => props.pulse ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(107, 70, 193, 0.7);
    }
    70% {
      transform: scale(1.02);
      box-shadow: 0 0 0 10px rgba(107, 70, 193, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(107, 70, 193, 0);
    }
  }
  
  &:hover:not(:disabled) {
    background-color: #553c9a;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
    animation: none;
  }
`;

const UploadButton = styled.button`
  padding: 1rem;
  background-color: #3182ce;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #2b6cb0;
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
  margin-top: 0.5rem;
`;

const RetakeButton = styled.button`
  flex: 1;
  padding: 0.8rem;
  background-color: #e53e3e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #c53030;
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const ConfirmButton = styled.button<{ fullWidth?: boolean }>`
  flex: 1;
  padding: 0.8rem;
  background-color: #38a169;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  &:hover:not(:disabled) {
    background-color: #2f855a;
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background-color: #fed7d7;
  color: #c53030;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
  width: 100%;
  font-size: 0.9rem;
`;

const PrivacyNote = styled.p`
  font-size: 0.85rem;
  color: #718096;
  text-align: center;
  margin-top: 1rem;
`;

const UploadContainer = styled.div`
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
`;

const UploadArea = styled.div`
  width: 100%;
  height: 0;
  padding-bottom: 75%; /* 4:3 비율 */
  position: relative;
  background-color: #f7fafc;
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
  
  &:hover {
    border-color: #6b46c1;
    background-color: #f0f5ff;
  }
`;

const UploadIcon = styled.div`
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.1rem;
  font-weight: 600;
  color: #4a5568;
`;

const UploadSubText = styled.p`
  position: absolute;
  top: 65%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.85rem;
  color: #718096;
  margin-top: 0.5rem;
`;

// 이미지 취소 버튼
const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

// 크롭 관련 스타일 컴포넌트 추가
const CropContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  padding: 1rem 0;
`;

const CropInstructions = styled.div`
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #4a5568;
  text-align: center;
  line-height: 1.4;
  
  strong {
    color: #6b46c1;
  }
`;

const CropButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
  margin-top: 0.5rem;
`;

const CancelCropButton = styled.button`
  flex: 1;
  padding: 0.8rem;
  background-color: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #cbd5e0;
  }
`;

const ConfirmCropButton = styled.button`
  flex: 1;
  padding: 0.8rem;
  background-color: #6b46c1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #553c9a;
  }
`;

// 이미지 편집 버튼
const EditButton = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

export default FaceCapture; 