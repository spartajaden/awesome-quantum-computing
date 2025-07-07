function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('현대해상 햇살봇')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function processUserInput(userInput, userProfile) {
  const age = parseInt(userProfile.age);
  const occupation = userProfile.occupation;
  const income = userProfile.income;
  const insuranceExperience = userProfile.insuranceExperience;
  
  let response = "";
  const disclaimer = "\n\n* 본 정보는 법적 구속력이 없으며, 정확한 내용은 상담원을 통해 확인해 주세요.";

  if (userInput.includes("안녕") || userInput.includes("시작") || userInput.includes("처음")) {
    response = `안녕하세요, ${userProfile.name}님! 현대해상 햇살봇입니다. 무엇을 도와드릴까요?`;
    return response + disclaimer;
  }

  if (userInput.includes("자동차") || userInput.includes("차량") || userInput.includes("자동차 보험")) {
    if (age >= 20 && age < 30) {
      response = "20대 고객님을 위한 합리적인 자동차보험 상품을 안내드립니다. 저렴한 보험료와 빠른 가입이 가능한 디지털 전용 상품을 추천드려요! www.hi.co.kr에서 5분 만에 가입 가능합니다.";
    } else if (age >= 30 && age < 50) {
      response = "30~40대 고객님을 위한 자동차보험 상품입니다. 온라인으로 정보를 확인한 후, 전문 상담사와 전화(1588-5656) 또는 화상 상담을 통해 최적의 보장 내용을 설계해 드립니다.";
    } else {
      response = "안전 중심의 자동차보험 상품을 안내드립니다. 가까운 지점 방문이나 상담 예약을 원하시면 1588-5656으로 연락 주세요!";
    }
    return response + disclaimer;
  }

  if (userInput.includes("실손") || userInput.includes("의료") || userInput.includes("병원") || userInput.includes("실손 의료보험")) {
    if (age >= 30 && age < 50) {
      response = "가족과 함께 실손의료보험을 찾으신다면, 자녀와 본인을 함께 보장하는 패밀리 플랜을 추천드립니다. www.hi.co.kr에서 자세한 보장 내용을 확인하세요.";
    } else {
      response = "고객님의 건강을 지키는 실손의료보험 상품입니다. 연령대별 맞춤 보장과 간편한 모바일 청구 방법을 확인해 보세요!";
    }
    return response + disclaimer;
  }

  if (userInput.includes("상담") || userInput.includes("문의") || userInput.includes("예약") || userInput.includes("상담 예약")) {
    if (age >= 20 && age < 30) {
      response = "빠른 온라인 상담을 원하시면 www.hi.co.kr에서 화상 상담을 예약하세요. 간편하고 빠르게 도와드립니다!";
    } else if (age >= 30 && age < 50) {
      response = "전문 상담사와의 전화 상담(1588-5656)을 예약하거나, 가까운 지점 방문 예약을 도와드릴까요?";
    } else {
      response = "가까운 현대해상 지점에서 대면 상담을 받아보세요. 지점 위치는 www.hi.co.kr에서 확인 가능합니다.";
    }
    return response + disclaimer;
  }

  if (userInput.includes("보험료 계산")) {
    if (age >= 20 && age < 30) {
      response = "간편한 보험료 계산을 원하시면 www.hi.co.kr에서 자동차보험 또는 실손보험의 예상 보험료를 바로 확인해 보세요!";
    } else {
      response = "보험료 계산은 www.hi.co.kr에서 가능합니다. 고객님의 프로필에 맞춘 정확한 견적을 받아보세요.";
    }
    return response + disclaimer;
  }

  if (userInput.includes("추천 상품")) {
    if (age >= 30 && age < 50) {
      response = "가족 중심의 실손의료보험과 결합 할인이 가능한 자동차보험을 추천드립니다. 자세한 내용은 www.hi.co.kr에서 확인하세요.";
    } else {
      response = "고객님께 맞는 보험 상품을 추천드립니다. www.hi.co.kr에서 다양한 상품을 비교해 보세요!";
    }
    return response + disclaimer;
  }

  if (userInput.includes("지점 안내")) {
    response = "현대해상 지점 위치는 www.hi.co.kr에서 확인 가능합니다. 가까운 지점을 찾아드릴까요? 고객센터(1588-5656)로도 문의 가능합니다.";
    return response + disclaimer;
  }

  return "궁금한 점이 있으시면 말씀해 주세요! 현대해상 햇살봇이 고객님께 맞춤형 답변을 드립니다." + disclaimer;
}

function saveUserProfile(userProfile) {
  return { success: true, message: "프로필이 저장되었습니다." };
}
