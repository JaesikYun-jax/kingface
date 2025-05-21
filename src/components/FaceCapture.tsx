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

/* 크롭 관련 코드 주석 처리
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
  // 최종 출력 크기는 컨테이너 크기와 동일하게 유지
  const outputSize = containerSize;
  canvas.width = outputSize;
  canvas.height = outputSize;

  // 이미지의 원래 크기 가져오기
  const imgWidth = image.naturalWidth;
  const imgHeight = image.naturalHeight;

  // 이미지 중심점 계산
  const centerX = imgWidth / 2;
  const centerY = imgHeight / 2;
  
  // 크롭할 영역 크기 - 적절한 크기 계산 조정
  // 스케일에 정확히 비례하도록 수정
  const sourceSize = containerSize / scale;
  const halfSourceSize = sourceSize / 2;
  
  // 오프셋 계산 - 스케일에 따른 정확한 오프셋 적용
  // 스케일에 오프셋 값을 나누어 변환 비율 적용
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
*/

const FaceCapture: React.FC<FaceCaptureProps> = ({ onCapture, isLoading = false }) => {
  // 기본 상태
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  /* 크롭 관련 상태 주석 처리
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
  */
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  /* 크롭 관련 함수 주석 처리
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
      
      // 이미지가 프레임을 더 많이 채우도록 조정
      // 1.1배로 조정하여 적절한 크기로 표시 (과도한 확대 방지)
      newScale = Math.min(newScale * 1.1, 3); // 1.1배 확대, 최대 3배까지
      
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
    if (!isDragging) return;
    
    // 마우스 또는 터치 이벤트의 좌표 가져오기
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    if (dragStart) {
      // 새로운 위치 계산
      setTranslateX(clientX - dragStart.x);
      setTranslateY(clientY - dragStart.y);
    }
  }, [isDragging, dragStart]);
  
  // 드래그 종료 핸들러
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // 확대/축소 슬라이더 변경 핸들러
  const handleScaleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setScale(parseFloat(e.target.value));
  }, []);
  
  // 이벤트 리스너 등록/해제
  useEffect(() => {
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('touchmove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleDrag, handleDragEnd]);
  
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
  */
  
  // 이미지 초기화
  const resetImage = useCallback(() => {
    setCapturedImage(null);
    // setOriginalImage(null);
    // setIsCropping(false);
  }, []);
  
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
        // 크롭 관련 코드 주석 처리
        // setOriginalImage(imageResult); // 원본 이미지 저장
        // setIsCropping(true); // 크롭 모드 활성화
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
  
  /* 크롭 관련 함수 주석 처리
  // 이미지 크롭 버튼 클릭
  const handleCropClick = useCallback(() => {
    if (capturedImage) {
      setOriginalImage(capturedImage);
      setIsCropping(true);
    }
  }, [capturedImage]);
  */
  
  // 확인 (분석 시작)
  const handleConfirm = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);
  
  return (
    <Container>
      <Title>AI 관상 분석</Title>
      <SubTitle>얼굴 사진을 업로드하여 AI 관상 분석을 받아보세요</SubTitle>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Content>
        <UploadContainer>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          
          {capturedImage ? (
            <SmallImageContainer>
              <CapturedImage src={capturedImage} alt="업로드된 이미지" />
              <CloseButton onClick={resetImage}>✕</CloseButton>
              {/* 크롭 버튼 주석 처리
              <EditButton onClick={handleCropClick}>✎</EditButton>
              */}
            </SmallImageContainer>
          ) : (
            <UploadArea onClick={handleUploadClick}>
              <UploadIcon>📷</UploadIcon>
              <UploadText>클릭하여 이미지 업로드</UploadText>
              <UploadSubText>JPG, PNG 형식 지원</UploadSubText>
            </UploadArea>
          )}
          
          {/* 크롭 모드 UI 주석 처리
          {isCropping && originalImage && (
            <CropContainer>
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
                
                <CropCircleOverlay />
              </SquareCropArea>
              
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
          )}
          */}
        </UploadContainer>
      </Content>
      
      <ButtonContainer>
        {!capturedImage ? (
          <UploadButton 
            onClick={handleUploadClick} 
            disabled={isLoading}
            fullWidth
          >
            📂 이미지 선택
          </UploadButton>
        ) : (
          <ConfirmButton onClick={handleConfirm} disabled={isLoading} fullWidth>
            {isLoading ? '분석 중...' : '확인'}
          </ConfirmButton>
        )}
      </ButtonContainer>
      
      <PrivacyNote>
        * 업로드한 이미지는 분석 목적으로만 사용되며, 서버에 영구 저장되지 않습니다.
      </PrivacyNote>
    </Container>
  );
};

// 스타일드 컴포넌트들 (기존 코드와 동일)
const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 1.75rem;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #2d3748;
`;

const SubTitle = styled.p`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #4a5568;
  font-size: 1rem;
`;

const Content = styled.div`
  margin-bottom: 1.5rem;
`;

const ErrorMessage = styled.div`
  background-color: #fed7d7;
  color: #c53030;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const UploadContainer = styled.div`
  width: 100%;
`;

const UploadArea = styled.div`
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #805ad5;
    background-color: #f7fafc;
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #4a5568;
`;

const UploadSubText = styled.p`
  font-size: 0.9rem;
  color: #718096;
`;

const SmallImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 100%; /* 정사각형 비율 유지 */
  border-radius: 12px;
  overflow: hidden;
  background-color: #000;
`;

const CapturedImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const EditButton = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
  width: 32px;
  height: 32px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const ButtonContainer = styled.div`
  margin-bottom: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ButtonBase = styled.button<{ fullWidth?: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const UploadButton = styled(ButtonBase)`
  background-color: white;
  color: #4a5568;
  border: 1px solid #cbd5e0;
  
  &:hover:not(:disabled) {
    background-color: #f7fafc;
    border-color: #a0aec0;
  }
`;

const ConfirmButton = styled(ButtonBase)`
  background-color: #6b46c1;
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #553c9a;
  }
`;

const ModeToggleButtons = styled.div`
  display: flex;
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;

const ModeButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 0.75rem;
  background-color: ${props => props.active ? '#6b46c1' : 'white'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? '#553c9a' : '#f7fafc'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrivacyNote = styled.p`
  text-align: center;
  font-size: 0.8rem;
  color: #718096;
  margin-top: 0.5rem;
`;

/* 크롭 관련 스타일 컴포넌트 주석 처리
// 새로운 크롭 관련 컴포넌트들
const CropContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const SquareCropArea = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%; // 정사각형 유지
  margin-bottom: 1rem;
  overflow: hidden;
  background-color: #000; // 검은 배경으로 변경 
  border-radius: 8px;
  touch-action: none; // 모바일에서 스크롤 방지
`;

const CropImageWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform; // 성능 최적화
`;

const CropCircleOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 75%;
  height: 75%;
  border: 2px dashed rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: rgba(255, 255, 255, 0.3);
  }
`;

const ZoomControl = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 300px;
  margin-bottom: 1rem;
`;

const ZoomIcon = styled.span`
  font-size: 1rem;
  color: #4a5568;
  padding: 0 0.5rem;
`;

const ZoomSlider = styled.input`
  flex: 1;
  -webkit-appearance: none;
  height: 4px;
  border-radius: 2px;
  background: #e2e8f0;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #6b46c1;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #6b46c1;
    cursor: pointer;
    border: none;
  }
`;

const CropInstructions = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background-color: #f7fafc;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #4a5568;
  line-height: 1.4;
`;

const CropButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
`;

const CancelCropButton = styled(ButtonBase)`
  flex: 1;
  background-color: white;
  color: #4a5568;
  border: 1px solid #cbd5e0;
  
  &:hover {
    background-color: #f7fafc;
    border-color: #a0aec0;
  }
`;

const ConfirmCropButton = styled(ButtonBase)`
  flex: 2;
  background-color: #6b46c1;
  color: white;
  border: none;
  
  &:hover {
    background-color: #553c9a;
  }
`;
*/

export default FaceCapture; 