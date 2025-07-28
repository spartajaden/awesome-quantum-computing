function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('하이케어봇')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Spreadsheet ID for storing chat history, feedback, and logs
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with your Google Sheets ID
const CHAT_SHEET_NAME = 'ChatHistory';
const FEEDBACK_SHEET_NAME = 'Feedback';
const LOG_SHEET_NAME = 'ErrorLogs';

// Rate limiting configuration
const RATE_LIMIT_KEY = 'userRateLimit';
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

// Intent keywords with weights
const INTENT_KEYWORDS = {
  'greeting': { keywords: ['안녕', '시작', '하이'], weight: 0.9 },
  'auto_insurance': { keywords: ['자동차', '차량', '자동차 보험'], weight: 0.8 },
  'medical_insurance': { keywords: ['실손', '의료', '병원', '실손 의료보험'], weight: 0.8 },
  'consultation': { keywords: ['상담', '문의', '예약', '상담 예약'], weight: 0.7 },
  'premium_calculation': { keywords: ['보험료 계산', '견적'], weight: 0.7 },
  'recommended_product': { keywords: ['추천 상품', '맞춤'], weight: 0.7 },
  'branch_info': { keywords: ['지점 안내', '지점'], weight: 0.6 },
  'feedback': { keywords: ['만족', '불만족', '피드백'], weight: 0.6 }
};

// Sanitize user input to prevent XSS
function sanitizeInput(input) {
  if (!input) return '';
  return input.replace(/[<>&"']/g, match => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;'
  }[match])).trim();
}

// Log errors to Google Sheets
function logError(error, context) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(LOG_SHEET_NAME) || ss.insertSheet(LOG_SHEET_NAME);
    const timestamp = new Date().toISOString();
    sheet.appendRow([timestamp, context, error.message || JSON.stringify(error)]);
  } catch (e) {
    Logger.log(`Error logging failed: ${e.message}`);
  }
}

// Check rate limit
function checkRateLimit(userId) {
  const cache = CacheService.getUserCache();
  const key = `${RATE_LIMIT_KEY}:${userId}`;
  let requests = JSON.parse(cache.get(key) || '{"count": 0, "startTime": 0}');
  
  const now = Date.now();
  if (now - requests.startTime > RATE_LIMIT_WINDOW_MS) {
    requests = { count: 0, startTime: now };
  }
  
  requests.count++;
  cache.put(key, JSON.stringify(requests), 3600); // Cache for 1 hour
  
  if (requests.count > MAX_REQUESTS_PER_WINDOW) {
    throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
  }
}

// Detect intent based on weighted keyword matching
function detectIntent(userInput) {
  let bestIntent = null;
  let highestScore = 0;
  
  for (const [intent, data] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;
    data.keywords.forEach(keyword => {
      if (userInput.toLowerCase().includes(keyword)) {
        score += data.weight;
      }
    });
    if (score > highestScore) {
      highestScore = score;
      bestIntent = intent;
    }
  }
  
  return bestIntent || 'unknown';
}

function processUserInput(userInput, userProfile) {
  try {
    // Sanitize input
    userInput = sanitizeInput(userInput);
    
    // Generate a simple user ID (e.g., based on name and timestamp)
    const userId = Utilities.base64Encode(userProfile.name + Date.now());
    checkRateLimit(userId);
    
    const age = parseInt(userProfile.age) || 30;
    const occupation = userProfile.occupation || '미입력';
    const income = parseInt(userProfile.income) || 0;
    const insuranceExperience = userProfile.insuranceExperience || '미입력';
    const interest = userProfile.interest || '미정/상담필요';
    
    let response = '';
    const disclaimer = '\n\n* 본 정보는 법적 구속력이 없으며, 정확한 내용은 상담원을 통해 확인해 주세요.';
    
    // Save chat to history
    saveChatHistory(userId, userProfile.name, userInput, 'user');
    
    const intent = detectIntent(userInput);
    
    switch (intent) {
      case 'greeting':
        response = `안녕하세요, ${userProfile.name}님! 현대해상 하이케어봇입니다. ${interest === '자동차보험' ? '자동차보험에 관심이 있으시군요! 견적을 바로 확인하시겠어요?' : interest === '실손보험' ? '실손의료보험에 관심이 있으시군요! 보장 내용을 안내드릴까요?' : '어떤 보험 상품에 대해 알아보고 싶으신가요?'}`;
        break;
        
      case 'auto_insurance':
        if (age >= 20 && age < 30) {
          response = `20대 ${occupation} 고객님을 위한 자동차보험 상품을 추천드립니다. ${insuranceExperience === '없음' ? '초보 운전자도 부담 없는' : '가입 경험이 있는 고객님께 적합한'} 저렴한 디지털 전용 상품을 www.hi.co.kr에서 5분 만에 가입 가능합니다!`;
        } else if (age >= 30 && age < 50) {
          response = `30~40대 ${occupation} 고객님을 위한 자동차보험입니다. ${income >= 500 ? '프리미엄 보장 옵션' : '합리적인 보장 옵션'}을 포함한 상품을 온라인(www.hi.co.kr) 또는 상담사(1588-5656)를 통해 설계해 보세요.`;
        } else {
          response = `안전 중심의 자동차보험 상품을 안내드립니다. ${occupation === '자영업' ? '업무용 차량도 보장 가능한' : ''} 상품을 확인하려면 지점 방문(www.hi.co.kr) 또는 1588-5656으로 연락 주세요!`;
        }
        break;
        
      case 'medical_insurance':
        if (age >= 30 && age < 50) {
          response = `${occupation} 고객님께 가족 중심 실손의료보험을 추천드립니다. ${income >= 500 ? '포괄적인 보장' : '합리적인 보장'}의 패밀리 플랜을 www.hi.co.kr에서 확인하세요. ${insuranceExperience.includes('실손') ? '기존 실손보험과의 중복 여부도 검토해 드립니다!' : ''}`;
        } else {
          response = `고객님의 건강을 위한 실손의료보험입니다. ${age >= 50 ? '고령자 맞춤 보장' : '연령대별 맞춤 보장'}과 모바일 청구 방법을 www.hi.co.kr에서 확인해 보세요!`;
        }
        break;
        
      case 'consultation':
        if (age >= 20 && age < 30) {
          response = `20대 ${occupation} 고객님께 빠른 온라인 상담을 추천드립니다. www.hi.co.kr에서 화상 상담을 예약하세요! ${insuranceExperience === '없음' ? '보험 가입이 처음이시라면 간단히 설명드릴게요.' : ''}`;
        } else if (age >= 30 && age < 50) {
          response = `${occupation} 고객님께 전문 상담사와의 전화 상담(1588-5656) 또는 지점 방문 예약을 추천드립니다. ${income >= 500 ? '프리미엄 상담 서비스도 제공됩니다!' : ''}`;
        } else {
          response = `대면 상담을 선호하시는 고객님께 가까운 현대해상 지점을 안내드립니다. 지점 위치는 www.hi.co.kr에서 확인하세요.`;
        }
        break;
        
      case 'premium_calculation':
        if (age >= 20 && age < 30) {
          response = `20대 ${occupation} 고객님께 간편한 보험료 계산을 추천드립니다. www.hi.co.kr에서 ${interest === '자동차보험' ? '자동차보험' : '실손보험'} 예상 보험료를 바로 확인하세요!`;
        } else {
          response = `보험료 계산은 www.hi.co.kr에서 가능합니다. ${occupation} 고객님의 ${income >= 500 ? '고소득' : '프로필'}에 맞춘 견적을 받아보세요.`;
        }
        break;
        
      case 'recommended_product':
        if (age >= 30 && age < 50) {
          response = `${occupation} 고객님께 가족 중심 실손의료보험과 자동차보험 결합 할인 상품을 추천드립니다. ${income >= 500 ? '프리미엄 보장 옵션' : '합리적인 보장 옵션'}을 www.hi.co.kr에서 확인하세요!`;
        } else {
          response = `${interest !== '미정/상담필요' ? `${interest} 관련` : ''} 맞춤 보험 상품을 추천드립니다. www.hi.co.kr에서 다양한 상품을 비교해 보세요!`;
        }
        break;
        
      case 'branch_info':
        response = `현대해상 지점 위치는 www.hi.co.kr에서 확인 가능합니다. ${occupation === '자영업' ? '업무용 상담이 필요하시면' : ''} 고객센터(1588-5656)로 문의 주세요.`;
        break;
        
      case 'feedback':
        response = `피드백을 주셔서 감사합니다! ${userInput.includes('만족') ? '만족하셨다니 기쁩니다!' : userInput.includes('불만족') ? '불편하셨던 점을 개선하겠습니다.' : '의견이 저장되었습니다.'} 추가로 도와드릴까요?`;
        saveFeedback(userId, userProfile.name, userInput);
        break;
        
      default:
        response = getBotReply(userInput);
    }
    
    // Save bot response to history
    saveChatHistory(userId, 'HiCareBot', response, 'bot');
    
    return response + disclaimer;
  } catch (error) {
    logError(error, 'processUserInput');
    return `오류가 발생했습니다: ${sanitizeInput(error.message)}. 잠시 후 다시 시도해주세요.\n\n* 본 정보는 법적 구속력이 없으며, 정확한 내용은 상담원을 통해 확인해 주세요.`;
  }
}

function getBotReply(userInput) {
  userInput = sanitizeInput(userInput).toLowerCase();
  let reply = '';
  
  if (userInput.includes('보험료')) {
    reply = '🚗 자동차 보험료 계산을 도와드릴게요! www.hi.co.kr에서 간편하게 견적을 확인하세요.';
  } else if (userInput.includes('상담')) {
    reply = '💬 전문 상담원 연결을 원하시나요? 1588-5656으로 전화 주시거나 www.hi.co.kr에서 예약하세요!';
  } else {
    reply = '🤖 하이케어봇이 잘 이해하지 못했어요. 자동차보험, 실손보험, 상담 예약 등 구체적으로 말씀해 주세요!';
  }
  
  return reply;
}

function saveUserProfile(userProfile) {
  try {
    // Sanitize profile fields
    const sanitizedProfile = {
      name: sanitizeInput(userProfile.name),
      gender: sanitizeInput(userProfile.gender),
      age: parseInt(userProfile.age) || 30,
      occupation: sanitizeInput(userProfile.occupation),
      income: parseInt(userProfile.income) || 0,
      insuranceExperience: sanitizeInput(userProfile.insuranceExperience),
      interest: sanitizeInput(userProfile.interest)
    };
    
    return { success: true, message: '프로필이 저장되었습니다.' };
  } catch (error) {
    logError(error, 'saveUserProfile');
    return { success: false, message: '프로필 저장에 실패했습니다.' };
  }
}

function saveChatHistory(userId, sender, message, type) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CHAT_SHEET_NAME) || ss.insertSheet(CHAT_SHEET_NAME);
    const timestamp = new Date().toISOString();
    sheet.appendRow([timestamp, userId, sender, sanitizeInput(message), type]);
  } catch (error) {
    logError(error, 'saveChatHistory');
  }
}

function saveFeedback(userId, userName, feedback) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(FEEDBACK_SHEET_NAME) || ss.insertSheet(FEEDBACK_SHEET_NAME);
    const timestamp = new Date().toISOString();
    sheet.appendRow([timestamp, userId, userName, sanitizeInput(feedback)]);
  } catch (error) {
    logError(error, 'saveFeedback');
  }
}

function loadFileData(fileName) {
  try {
    const files = DriveApp.getFilesByName(fileName);
    if (!files.hasNext()) {
      throw new Error(`File ${fileName} not found in Google Drive.`);
    }
    const file = files.next();
    return file.getBlob().getDataAsString();
  } catch (error) {
    logError(error, 'loadFileData');
    return ''; // Fallback to empty string to prevent frontend crash
  }
}
