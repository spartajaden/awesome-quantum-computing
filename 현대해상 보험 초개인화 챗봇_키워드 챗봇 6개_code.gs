function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('현대해상 햇살봇')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function processUserInput(userInput, userProfile) {
  const age = userProfile.age;
  const occupation = userProfile.occupation;
  const income = userProfile.income;
  const insuranceExperience = userProfile.insuranceExperience;

  let response = "";

  // Basic greeting
  if (userInput.includes("안녕") || userInput.includes("시작") || userInput.includes("처음")) {
    response = `안녕하세요, ${userProfile.name}님! 현대해상 햇살봇입니다. 무엇을 도와드릴까요?`;
    return response;
  }

  // Keyword-based responses
  if (age >= 20 && age < 50) { // Targeting 20-40s as core audience
    // 자동차/운전자/전자 (Car Insurance)
    if (userInput.includes("자동차") || userInput.includes("운전자") || userInput.includes("전자")) {
      if (age >= 20 && age < 30) {
        response = "20대님을 위한 저렴한 자동차보험! 온라인으로 5분 만에 가입 가능합니다. 지금 시작해 보세요!";
      } else { // 30-40s
        response = "30-40대님을 위한 자동차보험! 온라인 비교 후 전화상담으로 맞춤 설계 가능. 결합 할인도 확인하세요!";
      }
      return response;
    }

    // 실손/의료/병원 (Health Insurance)
    if (userInput.includes("실손") || userInput.includes("의료") || userInput.includes("병원")) {
      if (age >= 20 && age < 30) {
        response = "20대님을 위한 실손의료보험! 간단한 설명과 빠른 온라인 가입으로 부담 줄임.";
      } else { // 30-40s
        response = "30-40대 가족을 위한 실손의료보험! 자녀 포함 패밀리 플랜과 상담 예약 가능.";
      }
      return response;
    }

    // 상담/문의/연결 (Consultation)
    if (userInput.includes("상담") || userInput.includes("문의") || userInput.includes("연결")) {
      if (age >= 20 && age < 30) {
        response = "20대님, 온라인 화상 상담으로 빠르게 도움 드립니다. 지금 연결할까요?";
      } else { // 30-40s
        response = "30-40대님, 온라인 정보 확인 후 전화상담 예약 가능. 원하시는 시간대 알려주세요!";
      }
      return response;
    }

    // 보험 (General Insurance)
    if (userInput.includes("보험")) {
      if (age >= 20 && age < 30) {
        response = "20대님을 위한 보험 가이드! 저렴하고 간단한 상품부터 시작해 보세요.";
      } else { // 30-40s
        response = "30-40대님을 위한 보험 추천! 복수 보험 비교와 상담으로 최적화 가능.";
      }
      return response;
    }
  }

  // Default response for 20-40s or unrecognized input
  return "더 자세한 도움을 드리려면 키워드(자동차, 실손, 상담 등)를 말씀해 주세요. 맞춤형 답변을 준비하겠습니다!";
}
