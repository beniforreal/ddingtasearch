// 지역별 상품 데이터
const regionData = {
    wild: [
    // 농작물 및 식물
    { name: "건초 더미", price: "30 G" },
    { name: "호박", price: "2 G" },
    { name: "수박", price: "2 G" },
    { name: "대나무 블록", price: "1 G" },
    { name: "당근", price: "1 G" },
    { name: "감자", price: "1 G" },
    { name: "독이 있는 감자", price: "10 G" },
    { name: "비트", price: "3 G" },
    { name: "사탕수수", price: "1 G" },
    { name: "네더 사마귀", price: "2 G" },
    { name: "코코아 콩", price: "1 G" },
    { name: "달콤한 열매", price: "1 G" },
    { name: "사과", price: "10 G" },
    
    // 블록류
    { name: "철 블록", price: "100 G" },
    { name: "금 블록", price: "150 G" },
    { name: "다이아몬드 블록", price: "500 G" },
    { name: "에메랄드 블록", price: "1,000 G" },
    { name: "네더라이트 블록", price: "3,600 G" },
    { name: "석탄 블록", price: "40 G" },
    { name: "레드스톤 블록", price: "40 G" },
    { name: "청금석 블록", price: "40 G" },
    
    // 주괴/보석류
    { name: "철 주괴", price: "11 G" },
    { name: "금 주괴", price: "16 G" },
    { name: "다이아몬드", price: "55 G" },
    { name: "에메랄드", price: "110 G" },
    { name: "네더라이트 주괴", price: "400 G" },
    
    // 생선류
    { name: "익히지 않은 대구", price: "10 G" },
    { name: "익힌 대구", price: "30 G" },
    { name: "익히지 않은 연어", price: "20 G" },
    { name: "익힌 연어", price: "60 G" },
    { name: "열대어", price: "50 G" },
    { name: "복어", price: "30 G" },
    { name: "앵무조개 껍데기", price: "500 G" },
    { name: "익히지 않은 도미", price: "20 G" },
    { name: "익힌 도미", price: "60 G" },
    { name: "익히지 않은 새우", price: "20 G" },
    { name: "익힌 새우", price: "60 G" },
    { name: "익히지 않은 청어", price: "20 G" },
    { name: "익힌 청어", price: "60 G" },
    { name: "농어", price: "20 G" },
    { name: "금붕어", price: "20 G" },
    
    // 몬스터 드롭 아이템
    { name: "썩은 살점", price: "5 G" },
    { name: "뼈다귀", price: "5 G" },
    { name: "화약", price: "10 G" },
    { name: "블레이즈 막대기", price: "12 G" },
    { name: "블레이즈 가루", price: "6 G" },
    { name: "거미 눈", price: "7 G" },
    { name: "엔더 진주", price: "12 G" },
    { name: "먹물 주머니", price: "3 G" },
    { name: "발광 먹물 주머니", price: "3 G" },
    { name: "가스트 눈물", price: "200 G" },
    { name: "슬라임볼", price: "8 G" },
    { name: "실", price: "5 G" },
    { name: "마그마 크림", price: "10 G" },
    { name: "네더의 별", price: "1,000 G" },
    { name: "브리즈 막대기", price: "50 G" },
    
    // 고기류
    { name: "익히지 않은 소고기", price: "2 G" },
    { name: "익히지 않은 소갈비살", price: "2 G" },
    { name: "익히지 않은 소 등심", price: "2 G" },
    { name: "익히지 않은 돼지고기", price: "2 G" },
    { name: "익히지 않은 돼지 삼겹살", price: "2 G" },
    { name: "익히지 않은 돼지 앞다리살", price: "2 G" },
    { name: "익히지 않은 닭고기", price: "2 G" },
    { name: "익히지 않은 닭 다리살", price: "2 G" },
    { name: "익히지 않은 닭 가슴살", price: "2 G" },
    { name: "익히지 않은 양고기", price: "2 G" },
    { name: "익히지 않은 양 갈비살", price: "2 G" },
    { name: "익히지 않은 양 다리살", price: "2 G" },
    { name: "익히지 않은 토끼고기", price: "2 G" },
    { name: "가죽", price: "5 G" },
    { name: "토끼 가죽", price: "5 G" },
    { name: "토끼발", price: "10 G" },
    { name: "깃털", price: "3 G" },
    
    // 나무 원목류
    { name: "참나무 원목", price: "2 G" },
    { name: "가문비나무 원목", price: "2 G" },
    { name: "자작나무 원목", price: "2 G" },
    { name: "정글나무 원목", price: "2 G" },
    { name: "아카시아나무 원목", price: "2 G" },
    { name: "짙은 참나무 원목", price: "2 G" },
    { name: "맹그로브나무 원목", price: "2 G" },
    { name: "벚나무 원목", price: "2 G" },
    { name: "창백한 참나무 원목", price: "2 G" }
    ],
    
    grindel: {
        sell: [
            // 그린델 지역 판매 데이터
            { name: "토마토", price: "7 G" },
            { name: "양파", price: "11 G" },
            { name: "마늘", price: "7 G" },
            { name: "파인애플", price: "1 G" },
            { name: "코코넛", price: "1 G" },
            
            // 그린델 지역 가공 완성품 판매
            { name: "코룸 주괴", price: "13 G" },
            { name: "리프톤 주괴", price: "26 G" },
            { name: "세렌트 주괴", price: "44 G" },
            { name: "그라밋", price: "100 G" },
            { name: "에메리오", price: "200 G" },
            { name: "샤인플레어", price: "300 G" }
        ],
        
        buy: [
            // 그린델 지역 구매 데이터
            { name: "소금", price: "2 G" },
            { name: "요리용 달걀", price: "3 G" },
            { name: "요리용 우유", price: "3 G" },
            { name: "오일", price: "4 G" }
        ],
        
        process: [
            // 그린델 지역 가공 데이터 - 묶음류
            { name: "당근 묶음", price: "당근 64개" },
            { name: "감자 묶음", price: "감자 64개" },
            { name: "비트 묶음", price: "비트 64개" },
            { name: "호박 묶음", price: "호박 64개" },
            { name: "수박 묶음", price: "수박 64개" },
            { name: "달콤한 열매 묶음", price: "달콤한 열매 64개" },
            { name: "설탕 큐브", price: "설탕 64개" },
            { name: "요리용 소금", price: "소금 16개" },
            
            // 그린델 지역 가공 데이터 - 베이스류
            { name: "토마토 베이스", price: "토마토 8개" },
            { name: "양파 베이스", price: "양파 8개" },
            { name: "마늘 베이스", price: "마늘 8개" },
            
            // 그린델 지역 가공 데이터 - 조각류
            { name: "치즈 조각", price: "요리용 우유 8개 + 소금 8개" },
            { name: "밀가루 반죽", price: "밀 12개 + 요리용 달걀 4개" },
            { name: "버터 조각", price: "요리용 우유 8개 + 소금 4개 + 오일 4개" },
            
            // 그린델 지역 가공 데이터 - 강화 아이템
            { name: "강화 횃불", price: "횃불 4개" },
            { name: "강화 모닥불", price: "모닥불 2개" },
            
            // 그린델 지역 가공 데이터 - 뭉치류
            { name: "조약돌 뭉치", price: "조약돌 64개" },
            { name: "심층암 조약돌 뭉치", price: "심층암 64개" },
            
            // 그린델 지역 가공 데이터 - 라이프스톤
            { name: "하급 라이프스톤", price: "조약돌 뭉치 2개 + 구리 블록 8개 + 레드스톤 블록 3개 + 코룸 주괴 1개" },
            { name: "중급 라이프스톤", price: "심층암 조약돌 뭉치 2개 + 청금석 블록 5개 + 철 블록 5개 + 다이아몬드 블록 3개 + 리프톤 주괴 2개" },
            { name: "상급 라이프스톤", price: "구리 블록 30개 + 자수정 블록 20개 + 철 블록 7개 + 금 블록 7개 + 다이아몬드 블록 5개 + 세렌트 주괴 3개" },
            
            // 그린델 지역 가공 데이터 - 소울스톤
            { name: "하급 소울스톤", price: "코룸 주괴 1개 + 로즈샤드 1개 + 에릴코어 1개" },
            { name: "중급 소울스톤", price: "리프톤 주괴 1개 + 에릴코어 2개 + 바인하트 1개 + 스카이엣지 1개" },
            { name: "상급 소울스톤", price: "세렌트 주괴 1개 + 에릴코어 2개 + 바인하트 2개 + 스카이엣지 2개 + 솔라코드 1개" },
            
            // 그린델 지역 가공 데이터 - 세이지 도구
            { name: "세이지 괭이", price: "금 괭이 1개 + 버섯불 32개 + 밀 32개 + 비트 32개 + 당근 32개 + 감자 32개 + 발광 열매 32개" },
            { name: "세이지 곡괭이", price: "금 곡괭이 1개 + 조약돌 뭉치 4개 + 심층암 조약돌 뭉치 4개 + 자수정 블록 32개 + 구리 주괴 32개 + 다이아몬드 32개 + 네더라이트 주괴 4개" },
            { name: "세이지 낚싯대", price: "낚싯대 1개 + 익힌 새우 32개 + 익힌 도미 32개 + 익힌 청어 32개 + 금붕어 32개 + 농어 32개 + 열대어 4개" }
        ],
        
        cooking: [
            // 요리 변동성 가격 (최저가/최고가)
            { name: "토마토 스파게티", price: "157-524 G", ingredients: "토마토 베이스 1개 + 호박 묶음 1개" },
            { name: "어니언 링", price: "194-648 G", ingredients: "양파 베이스 2개 + 요리용 소금 1개" },
            { name: "갈릭 케이크", price: "102-342 G", ingredients: "마늘 베이스 1개 + 당근 묶음 1개" },
            { name: "삼겹살 토마토 찌개", price: "350-1,167 G", ingredients: "토마토 베이스 2개 + 비트 묶음 1개 + 요리용 소금 1개 + 익힌 돼지고기 1개 + 익힌 돼지 삼겹살 1개" },
            { name: "삼색 아이스크림", price: "408-1,362 G", ingredients: "양파 베이스 2개 + 수박 묶음 1개 + 코코넛 1개 + 설탕 큐브 1개 + 요리용 우유 1개" },
            { name: "마늘 양갈비 핫도그", price: "281-937 G", ingredients: "마늘 베이스 2개 + 감자 묶음 1개 + 오일 1개 + 익힌 양고기 1개 + 익힌 양 갈비살 1개" },
            { name: "스윗 치킨 햄버거", price: "517-1,724 G", ingredients: "토마토 베이스 1개 + 양파 베이스 1개 + 비트 묶음 1개 + 달콤한 열매 묶음 1개 + 익힌 닭 가슴살 1개 + 익힌 닭 다리살 1개" },
            { name: "토마토 파인애플 피자", price: "463-1,544 G", ingredients: "토마토 베이스 2개 + 마늘 베이스 2개 + 파인애플 1개 + 치즈 조각 1개 + 스테이크 1개 + 익힌 소 등심 1개" },
            { name: "양파 수프", price: "497-1,657 G", ingredients: "양파 베이스 2개 + 마늘 베이스 1개 + 감자 묶음 1개 + 코코넛 1개 + 버터 조각 1개 + 익힌 돼지 앞다리살 1개" },
            { name: "토마토 라자냐", price: "686-2,290 G", ingredients: "토마토 베이스 1개 + 양파 베이스 1개 + 마늘 베이스 1개 + 당근 묶음 1개 + 호박 묶음 1개 + 밀가루 반죽 1개 + 익힌 양 다리살 1개" }
        ],
        
        enhancement: [
            // 세이지 도구 강화 정보
            { name: "1강", price: "하급 라이프스톤 1개 + 5,000G", probability: "90%" },
            { name: "2강", price: "하급 라이프스톤 2개 + 25,000G", probability: "80%" },
            { name: "3강", price: "하급 라이프스톤 2개 + 50,000G", probability: "70%" },
            { name: "4강", price: "하급 라이프스톤 3개 + 중급 라이프스톤 1개 + 100,000G", probability: "60%" },
            { name: "5강", price: "하급 라이프스톤 3개 + 중급 라이프스톤 1개 + 180,000G", probability: "50%" },
            { name: "6강", price: "하급 라이프스톤 4개 + 중급 라이프스톤 2개 + 상급 라이프스톤 1개 + 270,000G", probability: "40%" },
            { name: "7강", price: "하급 라이프스톤 4개 + 중급 라이프스톤 2개 + 상급 라이프스톤 1개 + 루비 5개 + 320,000G", probability: "30%" },
            { name: "8강", price: "하급 라이프스톤 6개 + 중급 라이프스톤 3개 + 상급 라이프스톤 2개 + 루비 5개 + 650,000G", probability: "20%" },
            { name: "9강", price: "하급 라이프스톤 6개 + 중급 라이프스톤 3개 + 상급 라이프스톤 2개 + 루비 5개 + 700,000G", probability: "15%" },
            { name: "10강", price: "하급 라이프스톤 8개 + 중급 라이프스톤 4개 + 상급 라이프스톤 3개 + 루비 10개 + 1,000,000G", probability: "10%" },
            { name: "11강", price: "하급 라이프스톤 8개 + 중급 라이프스톤 4개 + 상급 라이프스톤 3개 + 루비 10개 + 1,100,000G", probability: "5%" },
            { name: "12강", price: "하급 라이프스톤 8개 + 중급 라이프스톤 4개 + 상급 라이프스톤 3개 + 루비 10개 + 1,200,000G", probability: "3%" },
            { name: "13강", price: "하급 라이프스톤 10개 + 중급 라이프스톤 6개 + 상급 라이프스톤 4개 + 루비 30개 + 1,300,000G", probability: "2%" },
            { name: "14강", price: "하급 라이프스톤 10개 + 중급 라이프스톤 6개 + 상급 라이프스톤 4개 + 루비 30개 + 1,500,000G", probability: "1%" },
            { name: "15강", price: "하급 라이프스톤 10개 + 중급 라이프스톤 6개 + 상급 라이프스톤 5개 + 루비 30개 + 2,000,000G", probability: "1%" }
        ]
    },
    
    collection: {
        blocks: [
            // 블록
            { name: "껍질 벗긴 참나무", price: "50개" },
            { name: "껍질 벗긴 가문비나무", price: "50개" },
            { name: "껍질 벗긴 자작나무", price: "50개" },
            { name: "껍질 벗긴 정글나무", price: "50개" },
            { name: "껍질 벗긴 아카시아나무", price: "50개" },
            { name: "껍질 벗긴 짙은 참나무", price: "50개" },
            { name: "껍질 벗긴 맹그로브나무", price: "50개" },
            { name: "껍질 벗긴 벚나무", price: "50개" },
            { name: "껍질 벗긴 창백한 참나무", price: "50개" },
            { name: "껍질 벗긴 진홍빛 균사", price: "50개" },
            { name: "껍질 벗긴 뒤틀린 균사", price: "50개" },
            { name: "엔드 돌", price: "50개" },
            { name: "퍼퍼 블록", price: "50개" },
            { name: "구리 격자", price: "50개" },
            { name: "하얀색 콘크리트", price: "50개" },
            { name: "하얀색 유광 테라코타", price: "50개" },
            { name: "차광 유리", price: "50개" },
            { name: "잔디 블록", price: "50개" },
            { name: "회백토", price: "50개" },
            { name: "균사체", price: "50개" },
            { name: "진흙", price: "50개" },
            { name: "붉은 모래", price: "50개" },
            { name: "얼음", price: "50개" },
            { name: "꽁꽁 언 얼음", price: "50개" },
            { name: "푸른얼음", price: "50개" },
            { name: "우는 흑요석", price: "50개" },
            { name: "영혼 모래", price: "50개" },
            { name: "석탄 광석", price: "50개" },
            { name: "심층암 석탄 광석", price: "10개" },
            { name: "철 광석", price: "50개" },
            { name: "심층암 철 광석", price: "50개" },
            { name: "구리 광석", price: "50개" },
            { name: "심층암 구리 광석", price: "50개" },
            { name: "금 광석", price: "50개" },
            { name: "심층암 금 광석", price: "50개" },
            { name: "레드스톤 광석", price: "50개" },
            { name: "심층암 레드스톤 광석", price: "50개" },
            { name: "에메랄드 광석", price: "50개" },
            { name: "심층암 에메랄드 광석", price: "5개" },
            { name: "청금석 광석", price: "50개" },
            { name: "심층암 청금석 광석", price: "50개" },
            { name: "다이아몬드 광석", price: "50개" },
            { name: "심층암 다이아몬드 광석", price: "50개" },
            { name: "네더 금 광석", price: "50개" },
            { name: "네더 석영 광석", price: "50개" },
            { name: "고대 잔해", price: "50개" },
            { name: "관 산호 블록", price: "50개" },
            { name: "뇌 산호 블록", price: "50개" },
            { name: "거품 산호 블록", price: "50개" },
            { name: "불 산호 블록", price: "50개" },
            { name: "사방산호 블록", price: "50개" },
            { name: "스컬크 촉매", price: "10개" },
            { name: "스컬크 비명체", price: "10개" }
        ],
        
        nature: [
            // 자연
            { name: "창백한 매달린 이끼", price: "50개" },
            { name: "뾰족한 점적석", price: "50개" },
            { name: "진홍빛 균", price: "50개" },
            { name: "뒤틀린 균", price: "50개" },
            { name: "파란색 난초", price: "50개" },
            { name: "알리움", price: "50개" },
            { name: "빨간색 튤립", price: "50개" },
            { name: "주황색 튤립", price: "50개" },
            { name: "하얀색 튤립", price: "50개" },
            { name: "분홍색 튤립", price: "50개" },
            { name: "은방울꽃", price: "50개" },
            { name: "횃불꽃", price: "1개" },
            { name: "감은 눈망울꽃", price: "50개" },
            { name: "뜬 눈망울꽃", price: "50개" },
            { name: "위더 장미", price: "10개" },
            { name: "분홍 꽃잎", price: "50개" },
            { name: "대나무", price: "50개" },
            { name: "선인장", price: "50개" },
            { name: "해바라기", price: "50개" },
            { name: "라일락", price: "50개" },
            { name: "장미 덤불", price: "50개" },
            { name: "모란", price: "50개" },
            { name: "벌레잡이풀", price: "1개" },
            { name: "큰 흘림잎", price: "50개" },
            { name: "작은 흘림잎", price: "50개" },
            { name: "발광 이끼", price: "50개" },
            { name: "스니퍼 알", price: "1개" },
            { name: "발광 열매", price: "50개" },
            { name: "달콤한 열매", price: "50개" },
            { name: "수련잎", price: "50개" },
            { name: "불우렁쉥이", price: "50개" },
            { name: "관 산호", price: "50개" },
            { name: "뇌 산호", price: "50개" },
            { name: "거품 산호", price: "50개" },
            { name: "불 산호", price: "50개" },
            { name: "사방산호", price: "50개" },
            { name: "부채형 관 산호", price: "50개" },
            { name: "부채형 뇌 산호", price: "50개" },
            { name: "부채형 거품 산호", price: "50개" },
            { name: "부채형 불 산호", price: "50개" },
            { name: "부채형 사방산호", price: "50개" }
        ],
        
        loot: [
            // 전리품
            { name: "거미줄", price: "50개" },
            { name: "엔더의 눈", price: "50개" },
            { name: "이름표", price: "10개" },
            { name: "안장", price: "10개" },
            { name: "삼지창", price: "1개" },
            { name: "가죽 말 갑옷", price: "10개" },
            { name: "철 말 갑옷", price: "5개" },
            { name: "금 말 갑옷", price: "5개" },
            { name: "다이아몬드 말 갑옷", price: "5개" },
            { name: "불사의 토템", price: "1개" },
            { name: "마법이 부여된 황금 사과", price: "1개" },
            { name: "후렴과", price: "50개" },
            { name: "케이크", price: "10개" },
            { name: "레드스톤 가루", price: "50개" },
            { name: "석탄", price: "50개" },
            { name: "숯", price: "50개" },
            { name: "에메랄드", price: "50개" },
            { name: "청금석", price: "50개" },
            { name: "다이아몬드", price: "50개" },
            { name: "네더 석영", price: "50개" },
            { name: "자수정 조각", price: "50개" },
            { name: "철 주괴", price: "50개" },
            { name: "구리 주괴", price: "50개" },
            { name: "금 주괴", price: "50개" },
            { name: "네더라이트 주괴", price: "10개" },
            { name: "먹물 주머니", price: "50개" },
            { name: "발광 먹물 주머니", price: "50개" },
            { name: "아르마딜로 인갑", price: "50개" },
            { name: "앵무조개 껍데기", price: "10개" },
            { name: "바다의 심장", price: "1개" },
            { name: "블레이즈 막대기", price: "50개" },
            { name: "브리즈 막대기", price: "10개" },
            { name: "무거운 코어", price: "1개" },
            { name: "네더의 별", price: "1개" },
            { name: "메아리 조각", price: "50개" },
            { name: "드래곤의 숨결", price: "50개" },
            { name: "토끼 발", price: "50개" },
            { name: "가스트 눈물", price: "50개" },
            { name: "경험치 병", price: "50개" }
        ],
        
        collectibles: [
            // 수집품
            { name: "음반 (13)", price: "1개" },
            { name: "음반 (cat)", price: "1개" },
            { name: "음반 (blocks)", price: "1개" },
            { name: "음반 (chirp)", price: "1개" },
            { name: "음반 (far)", price: "1개" },
            { name: "음반 (mall)", price: "1개" },
            { name: "음반 (mellohi)", price: "1개" },
            { name: "음반 (stal)", price: "1개" },
            { name: "음반 (strad)", price: "1개" },
            { name: "음반 (ward)", price: "1개" },
            { name: "음반 (11)", price: "1개" },
            { name: "음반 (Creator 오르골)", price: "1개" },
            { name: "음반 (wait)", price: "1개" },
            { name: "음반 (Creator)", price: "1개" },
            { name: "음반 (Precipice)", price: "1개" },
            { name: "음반 (otherside)", price: "1개" },
            { name: "음반 (Relic)", price: "1개" },
            { name: "음반 (5)", price: "1개" },
            { name: "음반 (Pigstep)", price: "1개" },
            { name: "낚시꾼 도자기 조각", price: "1개" },
            { name: "궁수 도자기 조각", price: "1개" },
            { name: "만세 도자기 조각", price: "1개" },
            { name: "칼날 도자기 조각", price: "1개" },
            { name: "양조가 도자기 조각", price: "1개" },
            { name: "불탐 도자기 조각", price: "1개" },
            { name: "위험 도자기 조각", price: "1개" },
            { name: "흐름 도자기 조각", price: "1개" },
            { name: "탐험가 도자기 조각", price: "1개" },
            { name: "친구 도자기 조각", price: "1개" },
            { name: "소용돌이 도자기 조각", price: "1개" },
            { name: "심장 도자기 조각", price: "1개" },
            { name: "찢어진 심장 도자기 조각", price: "1개" },
            { name: "짖음 도자기 조각", price: "1개" },
            { name: "광부 도자기 조각", price: "1개" },
            { name: "애도자 도자기 조각", price: "1개" },
            { name: "풍부 도자기 조각", price: "1개" },
            { name: "보물 도자기 조각", price: "1개" },
            { name: "긁개 도자기 조각", price: "1개" },
            { name: "다발 도자기 조각", price: "1개" },
            { name: "피신처 도자기 조각", price: "1개" },
            { name: "해골 도자기 조각", price: "1개" },
            { name: "콧바람 도자기 조각", price: "1개" },
            { name: "보초 갑옷 장식", price: "1개" },
            { name: "벡스 갑옷 장식", price: "1개" },
            { name: "야생 갑옷 장식", price: "1개" },
            { name: "해안 갑옷 장식", price: "1개" },
            { name: "사구 갑옷 장식", price: "1개" },
            { name: "길잡이 갑옷 장식", price: "1개" },
            { name: "사육사 갑옷 장식", price: "1개" },
            { name: "조형가 갑옷 장식", price: "1개" },
            { name: "주인 갑옷 장식", price: "1개" },
            { name: "파수 갑옷 장식", price: "1개" },
            { name: "고요 갑옷 장식", price: "1개" },
            { name: "물결 갑옷 장식", price: "1개" },
            { name: "돼지 코 갑옷 장식", price: "1개" },
            { name: "갈비뼈 갑옷 장식", price: "1개" },
            { name: "눈 갑옷 장식", price: "1개" },
            { name: "첨탑 갑옷 장식", price: "1개" },
            { name: "흐름 갑옷 장식", price: "1개" },
            { name: "나사 갑옷 장식", price: "1개" }
        ]
    }
};

// DOM 요소들
const searchInput = document.getElementById('searchInput');
const floatingSearchInput = document.getElementById('floatingSearchInput');
const tableBody = document.getElementById('tableBody');
const tabButtons = document.querySelectorAll('.tab-button');
const sectionTabs = document.getElementById('sectionTabs');
const sectionButtons = document.querySelectorAll('.section-button');
const priceHeader = document.getElementById('priceHeader');
const itemHeader = document.getElementById('itemHeader');
const itemHeaderText = document.getElementById('itemHeaderText');
const collectionInfo = document.getElementById('collectionInfo');
const costHeader = document.getElementById('costHeader');
const cookingLegend = document.getElementById('cookingLegend');
const cookingInfo = document.getElementById('cookingInfo');
const priceTimer = document.getElementById('priceTimer');
const timerDisplay = document.getElementById('timerDisplay');
const themeToggle = document.getElementById('themeToggle');
const toggleAllIcon = document.getElementById('toggleAllIcon');

// 현재 선택된 지역과 섹션
let currentRegion = 'wild';
let currentSection = 'sell';

// 타이머 관련 변수
let timerInterval = null;
let originalTimerPosition = null;

// 요리 가격 변동일 (매월 1, 3, 9, 12, 15, 18, 21, 24, 27, 30일 오전 3시)
const priceChangeDays = [1, 3, 9, 12, 15, 18, 21, 24, 27, 30];

// 다음 가격 변동 시간 계산
function getNextPriceChangeTime() {
    const now = new Date();
    const currentDay = now.getDate();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // 현재 시간이 오전 3시 이전인지 확인
    const isBefore3AM = currentHour < 3;
    
    // 오늘 날짜 기준으로 다음 변동일 찾기
    let nextChangeDay = null;
    let nextChangeDate = null;
    
    // 오늘 오전 3시가 지났는지 확인
    if (isBefore3AM && priceChangeDays.includes(currentDay)) {
        // 오늘 오전 3시가 아직 안 지났고, 오늘이 변동일이면 오늘 오전 3시
        nextChangeDate = new Date(now.getFullYear(), now.getMonth(), currentDay, 3, 0, 0);
    } else {
        // 다음 변동일 찾기
        for (let i = 0; i < priceChangeDays.length; i++) {
            const changeDay = priceChangeDays[i];
            if (changeDay > currentDay) {
                nextChangeDay = changeDay;
                break;
            }
        }
        
        // 이번 달에 다음 변동일이 없으면 다음 달 첫 번째 변동일
        if (nextChangeDay === null) {
            nextChangeDay = priceChangeDays[0];
            nextChangeDate = new Date(now.getFullYear(), now.getMonth() + 1, nextChangeDay, 3, 0, 0);
        } else {
            nextChangeDate = new Date(now.getFullYear(), now.getMonth(), nextChangeDay, 3, 0, 0);
        }
    }
    
    return nextChangeDate;
}

// 타이머 업데이트 함수
function updateTimer() {
    const nextChangeTime = getNextPriceChangeTime();
    const now = new Date();
    const timeDiff = nextChangeTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
        // 시간이 지났으면 다음 변동일로 업데이트
        const nextChangeTime = getNextPriceChangeTime();
        const newTimeDiff = nextChangeTime.getTime() - now.getTime();
        updateTimerDisplay(newTimeDiff);
    } else {
        updateTimerDisplay(timeDiff);
    }
}

// 타이머 표시 업데이트
function updateTimerDisplay(timeDiff) {
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    timerDisplay.textContent = `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
}

// 타이머 시작
function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    updateTimer(); // 즉시 한 번 실행
    timerInterval = setInterval(updateTimer, 1000);
}

// 타이머 중지
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// 스크롤 이벤트 핸들러
function handleScroll() {
    if (!priceTimer) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // 원래 위치 저장 (한 번만)
    if (originalTimerPosition === null) {
        const rect = priceTimer.getBoundingClientRect();
        originalTimerPosition = rect.top + scrollTop;
    }
    
    // 스크롤이 원래 위치를 넘어가면 고정, 그렇지 않으면 원래 위치로
    if (scrollTop > originalTimerPosition) {
        priceTimer.classList.add('fixed');
    } else {
        priceTimer.classList.remove('fixed');
    }
}

// 테이블 렌더링 함수
function renderTable(productsToShow) {
    tableBody.innerHTML = '';
    
    if (productsToShow.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="no-results">검색 결과가 없습니다.</td></tr>';
        return;
    }
    
    productsToShow.forEach(product => {
        const row = document.createElement('tr');
        let priceDisplay = product.price;
        
        // 강화 섹션일 경우 확률 정보 추가
        if (currentRegion === 'grindel' && currentSection === 'enhancement' && product.probability) {
            priceDisplay += ` (${product.probability})`;
        }

        // 원재료 비용 계산 (요리 섹션에서만)
        let costCellHtml = '';
        if (currentRegion === 'grindel' && currentSection === 'cooking' && product.ingredients) {
            const costInfo = computeTotalIngredientCost(product.ingredients);
            const suffix = costInfo.unknownCount > 0 ? ' (일부 제외)' : '';
            costCellHtml = `<td class="price-cost">${formatNumber(costInfo.total)} G${suffix}</td>`;
        }
        
        if (currentRegion === 'grindel' && currentSection === 'cooking') {
            const toggleIcon = product.ingredients ? '<span class="row-toggle expanded" aria-hidden="true">▶</span>' : '';
            if (product.ingredients) {
                row.classList.add('collapsible');
            }
            row.innerHTML = `
                <td>${toggleIcon}${product.name}</td>
                <td class="price">${priceDisplay}</td>
                ${costCellHtml}
            `;
        } else {
            row.innerHTML = `
                <td>${product.name}</td>
                <td class="price">${priceDisplay}</td>
            `;
        }
        
        // 검색 중이고 컬랙션북 아이템일 경우 파란색 스타일 적용
        if (searchInput.value.trim() !== '' && product.isCollection) {
            row.classList.add('collection-search-item');
        }
        
        tableBody.appendChild(row);

        // 재료 정보는 기존처럼 아래에 한 줄 표시
        if (currentRegion === 'grindel' && product.ingredients) {
            const ingredientsRow = document.createElement('tr');
            const colSpan = (currentRegion === 'grindel' && currentSection === 'cooking') ? 3 : 2;
            ingredientsRow.classList.add('ingredients-row');
            if (currentSection === 'cooking') {
                ingredientsRow.classList.add('collapsed');
            }
            ingredientsRow.innerHTML = `
                <td colspan="${colSpan}" class="ingredients-display">${formatIngredients(product.ingredients)}</td>
            `;
            tableBody.appendChild(ingredientsRow);

            // 원재료 비용 합계 표시
            // (요청에 따라 재료 아래 별도 행 표시는 제거되었습니다)
        }
    });
}

// 재료별 상세 정보 데이터
const ingredientDetails = {
    // 그린델 채집 아이템
    '토마토 베이스': { source: '그린델', recipe: '토마토 8개', cost: '8×7G = 56G' },
    '양파 베이스': { source: '그린델', recipe: '양파 8개', cost: '8×11G = 88G' },
    '마늘 베이스': { source: '그린델', recipe: '마늘 8개', cost: '8×7G = 56G' },
    '코코넛': { source: '그린델', recipe: '코코넛 1개', cost: '1×1G = 1G' },
    '파인애플': { source: '그린델', recipe: '파인애플 1개', cost: '1×1G = 1G' },
    
    // 구매/가공 제품
    '소금': { source: '그린델 구매', recipe: '소금 1개', cost: '1×2G = 2G' },
    '요리용 달걀': { source: '그린델 구매', recipe: '요리용 달걀 1개', cost: '1×3G = 3G' },
    '요리용 우유': { source: '그린델 구매', recipe: '요리용 우유 1개', cost: '1×3G = 3G' },
    '오일': { source: '그린델 구매', recipe: '오일 1개', cost: '1×4G = 4G' },
    '치즈 조각': { source: '그린델 가공', recipe: '요리용 우유 8개 + 소금 8개', cost: '8×3G + 8×2G = 40G' },
    '버터 조각': { source: '그린델 가공', recipe: '요리용 우유 8개 + 소금 4개 + 오일 4개', cost: '8×3G + 4×2G + 4×4G = 48G' },
    '요리용 소금': { source: '그린델 가공', recipe: '소금 16개', cost: '16×2G = 32G' },
    
    // 혼합 제품
    '밀가루 반죽': { source: '혼합', recipe: '밀 12개 + 요리용 달걀 4개', cost: '바닐라 + 4×3G = 12G' },
    
    // 묶음류
    '호박 묶음': { source: '바닐라 호박', recipe: '호박 64개', cost: '64×2G = 128G' },
    '당근 묶음': { source: '바닐라 당근', recipe: '당근 64개', cost: '64×1G = 64G' },
    '비트 묶음': { source: '바닐라 비트', recipe: '비트 64개', cost: '64×3G = 192G' },
    '수박 묶음': { source: '바닐라 수박', recipe: '수박 64개', cost: '64×2G = 128G' },
    '달콤한 열매 묶음': { source: '바닐라 달콤한 열매', recipe: '달콤한 열매 64개', cost: '64×1G = 64G' },
    '감자 묶음': { source: '바닐라 감자', recipe: '감자 64개', cost: '64×1G = 64G' },
    
    // 고기류
    '익힌 돼지고기': { source: '바닐라 돼지고기', recipe: '익히지 않은 돼지고기 1개', cost: '1×2G = 2G' },
    '익힌 돼지 삼겹살': { source: '바닐라 돼지 삼겹살', recipe: '익히지 않은 돼지 삼겹살 1개', cost: '1×2G = 2G' },
    '익힌 돼지 앞다리살': { source: '바닐라 돼지 앞다리살', recipe: '익히지 않은 돼지 앞다리살 1개', cost: '1×2G = 2G' },
    '익힌 닭 가슴살': { source: '바닐라 닭 가슴살', recipe: '익히지 않은 닭 가슴살 1개', cost: '1×2G = 2G' },
    '익힌 닭 다리살': { source: '바닐라 닭 다리살', recipe: '익히지 않은 닭 다리살 1개', cost: '1×2G = 2G' },
    '익힌 양고기': { source: '바닐라 양고기', recipe: '익히지 않은 양고기 1개', cost: '1×2G = 2G' },
    '익힌 양 갈비살': { source: '바닐라 양 갈비살', recipe: '익히지 않은 양 갈비살 1개', cost: '1×2G = 2G' },
    '익힌 양 다리살': { source: '바닐라 양 다리살', recipe: '익히지 않은 양 다리살 1개', cost: '1×2G = 2G' },
    '익힌 소 등심': { source: '바닐라 소 등심', recipe: '익히지 않은 소 등심 1개', cost: '1×2G = 2G' },
    '스테이크': { source: '바닐라 소고기', recipe: '익히지 않은 소고기 1개', cost: '1×2G = 2G' },
    
    // 설탕
    '설탕 큐브': { source: '바닐라 설탕', recipe: '설탕 64개', cost: '바닐라' }
};

// 요리 재료 문자열을 토큰별로 스타일링하여 HTML로 변환
function formatIngredients(ingredientsText) {
    // 분류 기준 세트
    const grindelGatherables = new Set(['토마토 베이스', '양파 베이스', '마늘 베이스', '코코넛', '파인애플']);
    const grindelPurchasesAndDerived = new Set(['소금', '요리용 달걀', '요리용 우유', '오일', '치즈 조각', '버터 조각', '요리용 소금']);
    const mixedProducts = new Set(['밀가루 반죽']); // 밀(바닐라) + 요리용 달걀(구매) 혼합
    const isBundleOrMeatOrSugar = (name) => name.includes('묶음') || name.startsWith('익힌 ') || name === '스테이크' || name === '설탕 큐브';

    const parts = ingredientsText.split('+').map(p => p.trim());
    const styledParts = parts.map(part => {
        // 수량 표기 제거 후 재료명 추출
        const name = part.replace(/\s*\d+개.*$/, '').trim();
        
        let className = 'ing';
        if (grindelGatherables.has(name)) {
            className += ' ing-gather';
        } else if (grindelPurchasesAndDerived.has(name)) {
            className += ' ing-buy';
        } else if (mixedProducts.has(name)) {
            className += ' ing-mixed';
        } else if (isBundleOrMeatOrSugar(name)) {
            className += ' ing-extra';
        }
        
        // 툴팁 데이터 속성 추가
        const detail = ingredientDetails[name];
        if (detail) {
            const tooltipText = `${detail.source}\n${detail.recipe}\n${detail.cost}`;
            return `<span class="${className}" data-tooltip="${tooltipText}">${part}</span>`;
        }
        
        return `<span class="${className}">${part}</span>`;
    });
    return `재료: ${styledParts.join(' + ')}`;
}

// 비용 합계 계산
function computeTotalIngredientCost(ingredientsText) {
    let total = 0;
    let unknownCount = 0;
    const parts = ingredientsText.split('+').map(p => p.trim());
    parts.forEach(part => {
        const name = part.replace(/\s*\d+개.*$/, '').trim();
        const qtyMatch = part.match(/(\d+)개/);
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
        const detail = ingredientDetails[name];
        if (!detail) { unknownCount++; return; }
        const costMatch = detail.cost && detail.cost.match(/=\s*([\d,]+)G/);
        if (costMatch) {
            const unit = parseInt(costMatch[1].replace(/,/g, ''), 10);
            total += unit * qty;
        } else {
            unknownCount++;
        }
    });
    return { total, unknownCount };
}

function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 검색 함수
function searchProducts() {
    const searchTerm = (searchInput.value || floatingSearchInput.value || '').toLowerCase().trim();
    
    if (searchTerm === '') {
        updateHeader(false); // 검색이 아닐 때
        collectionInfo.style.display = 'none'; // 컬랙션북 안내 숨기기
        renderTable(getCurrentProducts());
        return;
    }
    
    updateHeader(true); // 검색 중일 때
    
    let allProducts = [];
    
    // 모든 검색에서 컬랙션북 아이템도 포함 (컬랙션북 표시 추가)
    const allCollectionItems = [
        ...regionData.collection.blocks.map(item => ({...item, isCollection: true})),
        ...regionData.collection.nature.map(item => ({...item, isCollection: true})),
        ...regionData.collection.loot.map(item => ({...item, isCollection: true})),
        ...regionData.collection.collectibles.map(item => ({...item, isCollection: true}))
    ];
    
    if (currentRegion === 'wild') {
        allProducts = [...regionData.wild, ...allCollectionItems];
    } else if (currentRegion === 'grindel') {
        // 그린델 지역의 모든 섹션에서 검색 + 컬랙션북
        allProducts = [
            ...regionData.grindel.sell,
            ...regionData.grindel.buy,
            ...regionData.grindel.process,
            ...regionData.grindel.cooking,
            ...regionData.grindel.enhancement,
            ...allCollectionItems
        ];
    } else if (currentRegion === 'collection') {
        // 컬랙션북 지역의 모든 섹션에서 검색
        allProducts = allCollectionItems;
    } else {
        // 모든 지역에서 검색
        allProducts = [
            ...regionData.wild,
            ...regionData.grindel.sell,
            ...regionData.grindel.buy,
            ...regionData.grindel.process,
            ...regionData.grindel.cooking,
            ...regionData.grindel.enhancement,
            ...allCollectionItems
        ];
    }
    
    const filteredProducts = allProducts.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        const ingredientsMatch = product.ingredients && product.ingredients.toLowerCase().includes(searchTerm);
        const priceMatch = product.price && product.price.toLowerCase().includes(searchTerm);
        return nameMatch || ingredientsMatch || priceMatch;
    });
    
    // 컬랙션북 아이템이 검색 결과에 있는지 확인
    const hasCollectionItems = filteredProducts.some(product => product.isCollection);
    collectionInfo.style.display = hasCollectionItems ? 'block' : 'none';
    
    renderTable(filteredProducts);
}

// 현재 선택된 지역과 섹션의 데이터를 가져오는 함수
function getCurrentProducts() {
    if (currentRegion === 'wild') {
        return regionData.wild;
    } else if (currentRegion === 'grindel') {
        return regionData.grindel[currentSection];
    } else if (currentRegion === 'collection') {
        return regionData.collection[currentSection];
    }
    return [];
}

// 헤더 텍스트 업데이트 함수
function updateHeader(isSearching = false) {
    const headers = {
        sell: '판매 가격',
        buy: '구매 가격',
        process: '재료',
        cooking: '가격 범위',
        enhancement: '필요 재료'
    };
    
    // 요리 범례 표시 토글
    if (currentRegion === 'grindel' && currentSection === 'cooking') {
        if (cookingLegend) cookingLegend.style.display = 'block';
        if (cookingInfo) cookingInfo.style.display = 'block';
    } else {
        if (cookingLegend) cookingLegend.style.display = 'none';
        if (cookingInfo) cookingInfo.style.display = 'none';
    }
    
    // 원재료 비용 헤더 토글 + 헤더 토글 아이콘 표시
    if (currentRegion === 'grindel' && currentSection === 'cooking' && !isSearching) {
        if (costHeader) costHeader.style.display = '';
        if (toggleAllIcon) toggleAllIcon.style.display = '';
    } else {
        if (costHeader) costHeader.style.display = 'none';
        if (toggleAllIcon) toggleAllIcon.style.display = 'none';
    }
    
    if (isSearching) {
        priceHeader.textContent = '내용';
        if (itemHeaderText) itemHeaderText.textContent = '품목';
    } else if (currentRegion === 'grindel') {
        priceHeader.textContent = headers[currentSection] || '가격';
        if (currentSection === 'cooking') {
            if (itemHeaderText) itemHeaderText.textContent = '요리명';
        } else if (currentSection === 'enhancement') {
            if (itemHeaderText) itemHeaderText.textContent = '강화 단계';
        } else {
            if (itemHeaderText) itemHeaderText.textContent = '품목';
        }
    } else if (currentRegion === 'collection') {
        priceHeader.textContent = '달성 개수';
        if (itemHeaderText) itemHeaderText.textContent = '종류';
    } else {
        priceHeader.textContent = '판매 가격';
        if (itemHeaderText) itemHeaderText.textContent = '품목';
    }
}

// 탭 전환 함수
function switchRegion(region) {
    currentRegion = region;
    
    // 탭 버튼 활성화 상태 변경
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.region === region) {
            button.classList.add('active');
        }
    });
    
    // 그린델 또는 컬랙션북 지역일 때 섹션 탭 표시
    if (region === 'grindel') {
        sectionTabs.style.display = 'flex';
        currentSection = 'sell';
        showGrindelSections();
        updateSectionButtons();
    } else if (region === 'collection') {
        sectionTabs.style.display = 'flex';
        currentSection = 'blocks';
        showCollectionSections();
        updateSectionButtons();
    } else {
        sectionTabs.style.display = 'none';
    }
    
    // 검색어 초기화
    searchInput.value = '';
    floatingSearchInput.value = '';
    
    // 요리 섹션 정보 박스 토글
    if (region === 'grindel' && currentSection === 'cooking') {
        if (cookingInfo) cookingInfo.style.display = 'block';
    } else {
        if (cookingInfo) cookingInfo.style.display = 'none';
    }
    
    // 헤더 업데이트
    updateHeader();
    
    // 해당 지역 데이터 표시
    renderTable(getCurrentProducts());
}

// 섹션 버튼 활성화 상태 업데이트
function updateSectionButtons() {
    sectionButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.section === currentSection) {
            button.classList.add('active');
        }
    });
}

// 그린델 섹션 표시 함수
function showGrindelSections() {
    sectionButtons.forEach(button => {
        const section = button.dataset.section;
        if (['sell', 'buy', 'process', 'cooking', 'enhancement'].includes(section)) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    });
}

// 컬랙션북 섹션 표시 함수
function showCollectionSections() {
    sectionButtons.forEach(button => {
        const section = button.dataset.section;
        if (['blocks', 'nature', 'loot', 'collectibles'].includes(section)) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    });
}

// 섹션 전환 함수
function switchSection(section) {
    currentSection = section;
    updateSectionButtons();
    
    // 요리 섹션 정보 박스 토글
    if (currentRegion === 'grindel' && section === 'cooking') {
        if (cookingInfo) cookingInfo.style.display = 'block';
    } else {
        if (cookingInfo) cookingInfo.style.display = 'none';
    }
    
    updateHeader();
    searchInput.value = '';
    floatingSearchInput.value = '';
    renderTable(getCurrentProducts());
}

// 이벤트 리스너
searchInput.addEventListener('input', searchProducts);
floatingSearchInput.addEventListener('input', searchProducts);

// 탭 버튼 이벤트 리스너
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        switchRegion(button.dataset.region);
    });
});

// 섹션 버튼 이벤트 리스너
sectionButtons.forEach(button => {
    button.addEventListener('click', () => {
        switchSection(button.dataset.section);
    });
});

// 페이지 로드 시 야생 지역 데이터 표시
document.addEventListener('DOMContentLoaded', () => {
    updateHeader();
    renderTable(getCurrentProducts());
    
    // 초기 요리 정보 박스 상태 설정
    if (cookingInfo) cookingInfo.style.display = 'none';
    
    // 타이머 시작
    startTimer();
    
    // 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', handleScroll);

    // 다크 모드 초기화 및 이벤트 바인딩
    initTheme();
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // 전체 열기/닫기 아이콘 이벤트
    if (toggleAllIcon) {
        toggleAllIcon.addEventListener('click', toggleAllIngredients);
    }

    // 요리 탭 재료 접기/펼치기 위임 클릭 핸들러
    tableBody.addEventListener('click', (e) => {
        if (currentRegion !== 'grindel' || currentSection !== 'cooking') return;
        // tr.collapsible 또는 그 내부 클릭 시 처리
        let targetRow = e.target.closest('tr');
        if (!targetRow || !targetRow.classList.contains('collapsible')) return;
        const nextRow = targetRow.nextElementSibling;
        if (!nextRow || !nextRow.classList.contains('ingredients-row')) return;
        nextRow.classList.toggle('collapsed');
        // 토글 아이콘 회전
        const icon = targetRow.querySelector('.row-toggle');
        if (icon) icon.classList.toggle('expanded');
        // 전체 버튼 상태 업데이트
        updateToggleAllButton();
    });
});

// 테마 적용/토글 로직
function initTheme() {
    try {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') {
            document.body.classList.add('dark-theme');
            updateThemeToggleIcon();
        } else {
            document.body.classList.remove('dark-theme');
            updateThemeToggleIcon();
        }
    } catch (_) {
        // localStorage 접근 실패 시 무시
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    try {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (_) { /* ignore */ }
    updateThemeToggleIcon();
}

function updateThemeToggleIcon() {
    if (!themeToggle) return;
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', isDark ? '라이트 모드 전환' : '다크 모드 전환');
    themeToggle.setAttribute('title', isDark ? '라이트 모드 전환' : '다크 모드 전환');
}

// 전체 재료 열기/닫기 함수
function toggleAllIngredients() {
    if (currentRegion !== 'grindel' || currentSection !== 'cooking') return;
    
    const ingredientsRows = document.querySelectorAll('.ingredients-row');
    const collapsibleRows = document.querySelectorAll('.collapsible');
    
    if (ingredientsRows.length === 0) return;
    
    // 모든 재료 행이 접혀있는지 확인
    const allCollapsed = Array.from(ingredientsRows).every(row => row.classList.contains('collapsed'));
    
    // 모든 재료 행 토글
    ingredientsRows.forEach(row => {
        if (allCollapsed) {
            row.classList.remove('collapsed');
        } else {
            row.classList.add('collapsed');
        }
    });
    
    // 모든 토글 아이콘 상태 업데이트
    collapsibleRows.forEach(row => {
        const icon = row.querySelector('.row-toggle');
        if (icon) {
            if (allCollapsed) {
                icon.classList.add('expanded');
            } else {
                icon.classList.remove('expanded');
            }
        }
    });
    
    // 버튼 텍스트 업데이트
    updateToggleAllButton();
}

// 전체 토글 버튼 상태 업데이트
function updateToggleAllButton() {
    if (!toggleAllIcon || currentRegion !== 'grindel' || currentSection !== 'cooking') return;
    const ingredientsRows = document.querySelectorAll('.ingredients-row');
    if (ingredientsRows.length === 0) return;
    const allCollapsed = Array.from(ingredientsRows).every(row => row.classList.contains('collapsed'));
    const icon = toggleAllIcon.querySelector('.row-toggle');
    if (icon) {
        if (allCollapsed) {
            icon.classList.remove('expanded');
        } else {
            icon.classList.add('expanded');
        }
    }
}
