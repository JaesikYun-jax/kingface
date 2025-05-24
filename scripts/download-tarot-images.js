const fs = require("fs");
const path = require("path");
const https = require("https");

// 타로 카드 이미지를 저장할 경로
const TAROT_IMAGES_DIR = path.join(__dirname, "../public/assets/images/tarot");

// 총 카드 수
const CARD_COUNT = 30;

// Unsplash의 랜덤 타로 이미지 URL (예시로 사용)
const getRandomTarotImageUrl = (id) => {
  return `https://source.unsplash.com/random/300x400/?tarot,mystical,card&${id}`;
};

// 디렉토리가 존재하는지 확인하고 없으면 생성
if (!fs.existsSync(TAROT_IMAGES_DIR)) {
  fs.mkdirSync(TAROT_IMAGES_DIR, { recursive: true });
  console.log(`디렉토리 생성됨: ${TAROT_IMAGES_DIR}`);
}

/**
 * 이미지 다운로드 함수
 * @param {string} url - 다운로드할 이미지 URL
 * @param {string} destination - 저장할 경로
 * @returns {Promise<void>}
 */
const downloadImage = (url, destination) => {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        // 리다이렉션 처리
        if (response.statusCode === 302 || response.statusCode === 301) {
          return downloadImage(response.headers.location, destination)
            .then(resolve)
            .catch(reject);
        }

        // 200이 아니면 에러
        if (response.statusCode !== 200) {
          return reject(new Error(`상태 코드: ${response.statusCode}`));
        }

        // 파일 스트림 생성
        const fileStream = fs.createWriteStream(destination);

        // 데이터 스트리밍
        response.pipe(fileStream);

        // 이벤트 처리
        fileStream.on("finish", () => {
          fileStream.close();
          console.log(`다운로드 완료: ${destination}`);
          resolve();
        });

        fileStream.on("error", (err) => {
          fs.unlink(destination, () => {}); // 실패 시 파일 삭제 시도
          reject(err);
        });
      })
      .on("error", reject);
  });
};

/**
 * 모든 타로 카드 이미지 다운로드
 */
const downloadAllTarotImages = async () => {
  console.log("타로 카드 이미지 다운로드 시작...");

  for (let i = 0; i < CARD_COUNT; i++) {
    const imageUrl = getRandomTarotImageUrl(i);
    const imagePath = path.join(TAROT_IMAGES_DIR, `card-${i}.jpg`);

    try {
      // 이미 존재하는 파일인지 확인
      if (fs.existsSync(imagePath)) {
        console.log(`파일이 이미 존재합니다: ${imagePath}`);
        continue;
      }

      console.log(`다운로드 중: 카드 ${i}...`);
      await downloadImage(imageUrl, imagePath);
    } catch (error) {
      console.error(`카드 ${i} 다운로드 실패:`, error.message);
    }
  }

  console.log("타로 카드 이미지 다운로드 완료!");
};

// 스크립트 실행
downloadAllTarotImages().catch((err) => {
  console.error("오류 발생:", err);
});

// 사용 안내 메시지
console.log(`
===========================================
타로 카드 이미지 다운로드 스크립트

이 스크립트는 다음 위치에 타로 카드 이미지를 다운로드합니다:
${TAROT_IMAGES_DIR}

총 ${CARD_COUNT}개의 카드 이미지가 다운로드됩니다.
각 이미지는 'card-0.jpg', 'card-1.jpg' 등의 이름으로 저장됩니다.

직접 이미지를 추가하려면:
1. 원하는 타로 카드 이미지를 준비합니다.
2. 위 디렉토리에 'card-{id}.jpg' 형식으로 저장합니다.
   예: 'card-0.jpg', 'card-1.jpg', ... 'card-29.jpg'
3. 모든 이미지는 동일한 크기로 맞추는 것이 좋습니다 (300x400px 권장).

스크립트 실행 방법:
$ node scripts/download-tarot-images.js
===========================================
`);
