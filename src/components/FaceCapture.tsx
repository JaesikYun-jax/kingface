import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from '@emotion/styled';
import Webcam from 'react-webcam';
import { isMobile } from 'react-device-detect';

interface FaceCaptureProps {
  onCapture: (imageSrc: string) => void;
  isLoading?: boolean;
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
  
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 화면 크기에 따른 비디오 설정
  const videoConstraints = {
    width: isMobile ? 720 : 640,
    height: isMobile ? 1280 : 480,
    facingMode: cameraType,
  };
  
  // 카메라 스트림 초기화 함수
  const initializeCamera = useCallback(() => {
    setIsInitializing(true);
    setIsCameraReady(false);
    setVideoShown(false); // 비디오 표시 상태 초기화
    
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
    
    // 비디오 표시 설정 - 추가
    setTimeout(() => {
      setVideoShown(true);
    }, 300); // 웹캠이 준비된 후 약간의 지연을 두고 표시
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
    setUploadMode(prev => !prev);
    setCapturedImage(null);
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
        setCapturedImage(reader.result as string);
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
  
  return (
    <Container>
      <Title>AI 운명 이야기</Title>
      <SubTitle>
        {uploadMode 
          ? '사진을 업로드하고 당신만의 신비로운 이야기를 들어보세요' 
          : '사진을 찍고 당신만의 신비로운 이야기를 들어보세요'}
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
            
            {capturedImage ? (
              <SmallImageContainer>
                <CapturedImage src={capturedImage} alt="업로드된 이미지" />
                <CloseButton onClick={resetImage}>✕</CloseButton>
              </SmallImageContainer>
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
                    display: 'block', // 항상 표시하되 투명도로 제어
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    opacity: videoShown ? 1 : 0, // 비디오 표시 상태에 따라 투명도 조절
                    transition: 'opacity 0.3s ease',
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
        
        {!capturedImage ? (
          <>
            {!uploadMode && isCameraReady && (
              <ButtonGroup>
                <CameraButton onClick={toggleCamera} disabled={isLoading}>
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
  padding-bottom: 75%; /* 4:3 비율로 줄임 */
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
  padding-bottom: 75%; /* 4:3 비율 */
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
  object-fit: cover;
  border-radius: 12px;
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

export default FaceCapture; 