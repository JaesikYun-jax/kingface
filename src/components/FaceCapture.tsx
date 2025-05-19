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
  const [uploadMode, setUploadMode] = useState<boolean>(!isMobile); // PC에서는 기본값으로 업로드 모드 사용
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);
  
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 화면 크기에 따른 비디오 설정
  const videoConstraints = {
    width: isMobile ? 720 : 640,
    height: isMobile ? 1280 : 480,
    facingMode: cameraType,
  };
  
  // 컴포넌트 마운트 시 카메라 권한 확인
  useEffect(() => {
    if (!uploadMode) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => {
          setHasCameraPermission(true);
          setError(null);
        })
        .catch((err) => {
          console.log('Camera permission error:', err);
          setHasCameraPermission(false);
          setUploadMode(true); // 카메라 권한이 없으면 업로드 모드로 전환
          setError('카메라에 접근할 수 없어 이미지 업로드 모드로 전환합니다.');
        });
    }
  }, [uploadMode]);
  
  // 웹캠이 준비되었을 때 호출되는 함수
  const handleUserMedia = useCallback(() => {
    setIsCameraReady(true);
    setError(null);
  }, []);
  
  // 웹캠 에러 처리
  const handleUserMediaError = useCallback((err: string | DOMException) => {
    console.error('Webcam error:', err);
    setError('카메라에 접근할 수 없습니다. 권한을 확인하거나 이미지 업로드를 이용해주세요.');
    setIsCameraReady(false);
    setUploadMode(true); // 에러 발생 시 업로드 모드로 전환
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
    
    // Webcam 컴포넌트 참조 초기화
    if (webcamRef.current) {
      // 카메라 스트림 재설정을 위한 지연 추가
      setTimeout(() => {
        if (webcamRef.current) {
          try {
            // 카메라 스트림 강제 재설정
            const video = webcamRef.current.video;
            if (video && video.srcObject) {
              const tracks = (video.srcObject as MediaStream).getTracks();
              tracks.forEach(track => track.stop());
            }
            // 웹캠 컴포넌트 내부 상태 재설정
            webcamRef.current.stream = null;
            webcamRef.current.video = null;
          } catch (err) {
            console.error("카메라 초기화 오류:", err);
          }
        }
      }, 100);
    }
  }, [webcamRef]);
  
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
                {!isCameraReady && !error && (
                  <LoadingMessage>카메라 로딩 중...</LoadingMessage>
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
                    display: isCameraReady ? 'block' : 'none',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '12px',
                  }}
                />
              </SmallWebcamContainer>
            )}
          </>
        )}
      </Content>
      
      <ButtonContainer>
        <ModeToggleButtons>
          <ModeButton 
            active={!uploadMode} 
            onClick={() => {
              if (uploadMode) toggleUploadMode();
            }}
            disabled={isLoading || (!uploadMode && !hasCameraPermission)}
          >
            📸 카메라 촬영
          </ModeButton>
          
          <ModeButton 
            active={uploadMode} 
            onClick={() => {
              if (!uploadMode) toggleUploadMode();
            }}
            disabled={isLoading}
          >
            🖼️ 이미지 업로드
          </ModeButton>
        </ModeToggleButtons>
        
        {!uploadMode && !capturedImage && isCameraReady && (
          <CameraButton onClick={toggleCamera} disabled={isLoading}>
            📱 카메라 전환
          </CameraButton>
        )}
        
        {!capturedImage ? (
          <>
            {!uploadMode && (
              <CaptureButton 
                onClick={handleCapture} 
                disabled={!isCameraReady || isLoading}
              >
                📸 사진 촬영
              </CaptureButton>
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

const LoadingMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 1.2rem;
  font-weight: 500;
  z-index: 1;
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

const CaptureButton = styled.button`
  padding: 1rem;
  background-color: #6b46c1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #553c9a;
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
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