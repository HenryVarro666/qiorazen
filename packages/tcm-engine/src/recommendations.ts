import type { ConstitutionType } from "@qiorazen/types";

export interface DetailedItem {
  text: string;
  why: string;
}

export interface Recommendations {
  dietary: { en: string[]; zh: string[] };
  activity: { en: string[]; zh: string[] };
  lifestyle: { en: string[]; zh: string[] };
}

export interface PaidRecommendations {
  /** Dietary items with explanations */
  dietary: { en: DetailedItem[]; zh: DetailedItem[] };
  /** Foods/habits to minimize */
  avoid: { en: DetailedItem[]; zh: DetailedItem[] };
  /** Activity guidance with reasoning */
  activity: { en: DetailedItem[]; zh: DetailedItem[] };
  /** Daily routine suggestions */
  dailyRoutine: { en: string[]; zh: string[] };
  /** Seasonal vulnerability + what to do */
  seasonal: { en: { season: string; guidance: string }[]; zh: { season: string; guidance: string }[] };
  /** Tea/drink recommendations */
  drinks: { en: string[]; zh: string[] };
}

const RECOMMENDATIONS: Record<ConstitutionType, Recommendations> = {
  balanced: {
    dietary: {
      en: [
        "Maintain a varied, balanced diet",
        "Include seasonal fruits and vegetables",
        "Moderate portions, regular meal times",
      ],
      zh: [
        "保持饮食多样均衡",
        "多吃应季水果蔬菜",
        "适量饮食，按时进餐",
      ],
    },
    activity: {
      en: [
        "Regular moderate exercise, 30 min daily",
        "Mix cardio and flexibility training",
        "Outdoor activities when possible",
      ],
      zh: [
        "每天适度运动30分钟",
        "有氧运动与柔韧训练结合",
        "尽可能多做户外活动",
      ],
    },
    lifestyle: {
      en: [
        "Maintain regular sleep schedule",
        "Manage stress through mindfulness or hobbies",
        "Stay socially connected",
      ],
      zh: [
        "保持规律的作息时间",
        "通过正念或爱好管理压力",
        "保持社交联系",
      ],
    },
  },

  qi_deficiency: {
    dietary: {
      en: [
        "Warm, cooked foods are generally preferable",
        "Consider foods like sweet potato, rice, chicken",
        "Ginger tea may be soothing",
      ],
      zh: [
        "适宜温热、易消化的食物",
        "可考虑红薯、大米、鸡肉等",
        "姜茶可能有助于舒适感",
      ],
    },
    activity: {
      en: [
        "Gentle exercises like walking or tai chi",
        "Avoid overexertion, rest when needed",
        "Gradual progression in exercise intensity",
      ],
      zh: [
        "适宜散步、太极拳等柔和运动",
        "避免过度劳累，适时休息",
        "循序渐进增加运动强度",
      ],
    },
    lifestyle: {
      en: [
        "Prioritize adequate rest and sleep",
        "Avoid staying up late",
        "Keep warm in cold weather",
      ],
      zh: [
        "保证充足的休息和睡眠",
        "避免熬夜",
        "天冷注意保暖",
      ],
    },
  },

  yang_deficiency: {
    dietary: {
      en: [
        "Warm and cooked foods are generally preferable",
        "Consider ginger, cinnamon, lamb in moderation",
        "Limit cold drinks and raw foods",
      ],
      zh: [
        "适宜温热食物",
        "可适量考虑生姜、肉桂、羊肉",
        "少吃冷饮和生冷食物",
      ],
    },
    activity: {
      en: [
        "Moderate exercise to build warmth",
        "Morning sun exposure may feel beneficial",
        "Avoid exercising in cold environments",
      ],
      zh: [
        "适度运动帮助温暖身体",
        "早晨晒太阳可能有益",
        "避免在寒冷环境中运动",
      ],
    },
    lifestyle: {
      en: [
        "Keep feet and lower back warm",
        "Warm foot soaks before bed",
        "Dress warmly, especially in winter",
      ],
      zh: [
        "注意脚和腰部保暖",
        "睡前温水泡脚",
        "穿着保暖，尤其冬季",
      ],
    },
  },

  yin_deficiency: {
    dietary: {
      en: [
        "Hydrating foods like pears, cucumbers, tofu",
        "Light, moistening preparations",
        "Limit spicy and fried foods",
      ],
      zh: [
        "适宜梨、黄瓜、豆腐等滋润食物",
        "清淡、滋润的做法",
        "少吃辛辣和油炸食物",
      ],
    },
    activity: {
      en: [
        "Calming exercises like yoga or swimming",
        "Avoid intense sweating",
        "Evening walks in cool air",
      ],
      zh: [
        "适宜瑜伽、游泳等舒缓运动",
        "避免大量出汗",
        "傍晚凉爽时散步",
      ],
    },
    lifestyle: {
      en: [
        "Early to bed, aim for quality sleep",
        "Stay hydrated throughout the day",
        "Calming activities before bed",
      ],
      zh: [
        "早睡，注重睡眠质量",
        "全天保持充足饮水",
        "睡前做些放松活动",
      ],
    },
  },

  phlegm_dampness: {
    dietary: {
      en: [
        "Light, easily digestible foods",
        "Consider barley, mung beans, leafy greens",
        "Limit greasy, sweet, and heavy foods",
      ],
      zh: [
        "清淡、易消化的食物",
        "可考虑薏米、绿豆、绿叶蔬菜",
        "少吃油腻、甜腻、厚味的食物",
      ],
    },
    activity: {
      en: [
        "Active exercise that promotes sweating",
        "Regular cardio like jogging or cycling",
        "Stay physically active daily",
      ],
      zh: [
        "多做能出汗的运动",
        "规律有氧运动如慢跑、骑车",
        "每天保持身体活跃",
      ],
    },
    lifestyle: {
      en: [
        "Stay in dry, well-ventilated environments",
        "Avoid sitting or lying for extended periods",
        "Regular meal times, avoid late-night eating",
      ],
      zh: [
        "保持环境干燥通风",
        "避免久坐久卧",
        "定时进餐，避免夜宵",
      ],
    },
  },

  damp_heat: {
    dietary: {
      en: [
        "Cool, light foods like cucumber, watermelon, green tea",
        "Avoid alcohol, spicy and greasy foods",
        "Include bitter greens in your diet",
      ],
      zh: [
        "适宜清凉食物如黄瓜、西瓜、绿茶",
        "避免饮酒、辛辣和油腻食物",
        "适当吃些苦味蔬菜",
      ],
    },
    activity: {
      en: [
        "Moderate intensity exercise",
        "Swimming or water activities",
        "Avoid exercising in hot, humid conditions",
      ],
      zh: [
        "中等强度运动",
        "游泳等水上活动",
        "避免在炎热潮湿环境运动",
      ],
    },
    lifestyle: {
      en: [
        "Keep skin clean and dry",
        "Wear breathable fabrics",
        "Maintain good hygiene habits",
      ],
      zh: [
        "保持皮肤清洁干燥",
        "穿透气面料的衣服",
        "保持良好的卫生习惯",
      ],
    },
  },

  blood_stasis: {
    dietary: {
      en: [
        "Consider foods like hawthorn, turmeric, dark leafy greens",
        "Warm, well-cooked meals",
        "Stay well-hydrated",
      ],
      zh: [
        "可考虑山楂、姜黄、深色绿叶蔬菜",
        "温热、熟制的饮食",
        "保持充足饮水",
      ],
    },
    activity: {
      en: [
        "Regular movement throughout the day",
        "Stretching and flexibility exercises",
        "Avoid prolonged sitting",
      ],
      zh: [
        "全天保持规律活动",
        "多做拉伸和柔韧性训练",
        "避免长时间久坐",
      ],
    },
    lifestyle: {
      en: [
        "Stay warm, protect from cold wind",
        "Regular sleep schedule",
        "Gentle self-massage may be soothing",
      ],
      zh: [
        "注意保暖，避风寒",
        "规律作息",
        "适当自我按摩可能有助舒适",
      ],
    },
  },

  qi_stagnation: {
    dietary: {
      en: [
        "Aromatic, lightly flavored foods",
        "Consider citrus fruits, jasmine tea, mint",
        "Avoid excessive caffeine and alcohol",
      ],
      zh: [
        "芳香、口味清淡的食物",
        "可考虑柑橘类水果、茉莉花茶、薄荷",
        "避免过多咖啡因和酒精",
      ],
    },
    activity: {
      en: [
        "Activities that promote flow: dancing, jogging, hiking",
        "Group activities and social sports",
        "Deep breathing exercises",
      ],
      zh: [
        "促进气血流通的活动：舞蹈、慢跑、爬山",
        "集体活动和社交运动",
        "深呼吸练习",
      ],
    },
    lifestyle: {
      en: [
        "Express emotions, talk to friends",
        "Engage in creative hobbies",
        "Spend time in nature",
      ],
      zh: [
        "适当表达情绪，和朋友交流",
        "培养创造性爱好",
        "多亲近大自然",
      ],
    },
  },

  inherited_special: {
    dietary: {
      en: [
        "Identify and avoid personal food sensitivities",
        "Simple, whole foods with minimal additives",
        "Keep a food diary to track reactions",
      ],
      zh: [
        "找到并避免个人食物敏感源",
        "简单、天然、少添加剂的食物",
        "记录饮食日记追踪反应",
      ],
    },
    activity: {
      en: [
        "Exercise in clean air environments",
        "Moderate, consistent exercise routine",
        "Avoid extreme temperatures during activity",
      ],
      zh: [
        "在空气清新的环境运动",
        "适度、规律的运动",
        "运动时避免极端温度",
      ],
    },
    lifestyle: {
      en: [
        "Use hypoallergenic products",
        "Keep living spaces clean and dust-free",
        "Monitor seasonal changes and adapt",
      ],
      zh: [
        "使用低敏产品",
        "保持居住环境清洁无尘",
        "关注季节变化并适应调整",
      ],
    },
  },
};

export function getRecommendations(constitution: ConstitutionType): Recommendations {
  return RECOMMENDATIONS[constitution];
}

const PAID_RECOMMENDATIONS: Record<ConstitutionType, PaidRecommendations> = {
  balanced: {
    dietary: {
      en: [
        { text: "Eat a variety of whole grains, vegetables, and lean proteins", why: "Your balanced constitution thrives on variety — no single food group needs emphasis" },
        { text: "Include seasonal fruits matching the current climate", why: "Seasonal eating maintains your natural harmony with the environment" },
        { text: "Moderate portions at regular times, avoid skipping meals", why: "Consistent rhythm supports your already stable digestive function" },
      ],
      zh: [
        { text: "多种全谷物、蔬菜和优质蛋白搭配", why: "平和质适合均衡饮食，无需特别偏重某类食物" },
        { text: "多吃当季水果，顺应气候变化", why: "应季饮食有助于维持您与环境的自然和谐" },
        { text: "适量饮食，按时进餐，避免不吃饭", why: "规律的饮食节奏维护您稳定的消化功能" },
      ],
    },
    avoid: {
      en: [
        { text: "Excessive greasy or heavily processed foods", why: "Even balanced constitutions can shift if dietary habits deteriorate over time" },
        { text: "Irregular eating schedules or frequent late-night meals", why: "Disrupted rhythm is the fastest way to lose constitutional balance" },
      ],
      zh: [
        { text: "过于油腻或高度加工的食物", why: "即使平和体质，长期不良饮食也会导致偏颇" },
        { text: "饮食不规律或频繁夜宵", why: "节奏紊乱是失去体质平衡的最快方式" },
      ],
    },
    activity: {
      en: [
        { text: "30 minutes of moderate exercise daily — walking, cycling, swimming", why: "Your body responds well to consistent moderate activity" },
        { text: "Mix cardio with flexibility work like yoga or stretching", why: "Balanced constitutions benefit from balanced exercise approaches" },
      ],
      zh: [
        { text: "每天30分钟中等强度运动——散步、骑车、游泳", why: "您的身体对持续的适度运动反应良好" },
        { text: "有氧运动与柔韧训练（如瑜伽、拉伸）结合", why: "平和体质适合均衡的运动方式" },
      ],
    },
    dailyRoutine: {
      en: ["Rise with the sun, sleep before 11pm", "Maintain a consistent daily rhythm across seasons", "Engage in social activities and creative hobbies for mental wellness"],
      zh: ["日出而作，23点前入睡", "四季保持一致的作息节奏", "多参与社交活动和创造性爱好，维护心理健康"],
    },
    seasonal: {
      en: [
        { season: "Spring", guidance: "Gradually increase outdoor activities as the weather warms" },
        { season: "Summer", guidance: "Stay hydrated, moderate sun exposure for vitamin D" },
        { season: "Autumn", guidance: "Transition to warmer foods as temperatures drop" },
        { season: "Winter", guidance: "Maintain exercise indoors, prioritize rest and sleep" },
      ],
      zh: [
        { season: "春季", guidance: "随天气回暖逐步增加户外活动" },
        { season: "夏季", guidance: "充足饮水，适度晒太阳补充维生素D" },
        { season: "秋季", guidance: "随气温下降转向温热食物" },
        { season: "冬季", guidance: "坚持室内运动，注重休息和睡眠" },
      ],
    },
    drinks: {
      en: ["Green tea in spring/summer", "Warm water with a slice of lemon", "Chrysanthemum tea in autumn"],
      zh: ["春夏饮绿茶", "温水加柠檬片", "秋季饮菊花茶"],
    },
  },
  qi_deficiency: {
    dietary: {
      en: [
        { text: "Sweet potato, yam, and root vegetables as staples", why: "These warm, easy-to-digest foods gently nourish your depleted Qi without overtaxing digestion" },
        { text: "Chicken soup, especially with ginger and dates", why: "Traditionally considered one of the best Qi-tonifying foods — warm, nourishing, and easy to absorb" },
        { text: "Cooked whole grains like rice, oats, and millet", why: "Cooked grains are gentler on your digestive system than raw or cold foods" },
        { text: "Small, frequent meals rather than large portions", why: "Your digestion works best with steady, manageable amounts" },
      ],
      zh: [
        { text: "以红薯、山药等根茎类食物为主食", why: "这些温和易消化的食物能温补气虚，不会加重消化负担" },
        { text: "鸡汤，尤其加入生姜和大枣", why: "传统认为是最好的补气食物之一——温暖滋养，容易吸收" },
        { text: "熟制全谷物如大米、燕麦、小米", why: "熟制谷物对您的消化系统更温和" },
        { text: "少量多餐，不宜过饱", why: "您的消化功能适合稳定、适量的进食" },
      ],
    },
    avoid: {
      en: [
        { text: "Raw, cold foods and iced drinks", why: "Cold foods further deplete your already insufficient Qi and slow digestion" },
        { text: "Excessive spicy or greasy foods", why: "These drain energy through overstimulation of your digestive system" },
        { text: "Skipping breakfast or eating too late", why: "Your Qi is weakest in the morning — breakfast is essential fuel" },
      ],
      zh: [
        { text: "生冷食物和冰饮", why: "冷食会进一步耗伤本已不足的气，减缓消化" },
        { text: "过辣或过于油腻的食物", why: "这些食物通过过度刺激消化系统消耗能量" },
        { text: "不吃早餐或吃得太晚", why: "早晨气最弱——早餐是必需的能量补充" },
      ],
    },
    activity: {
      en: [
        { text: "Gentle walking, 20-30 minutes after meals", why: "Light movement aids your slower digestion without depleting energy" },
        { text: "Tai chi or qigong — slow, intentional movement", why: "These specifically cultivate Qi through breath and controlled movement" },
        { text: "Avoid exhaustive exercise — stop before you feel drained", why: "Overexertion depletes your Qi further; the goal is gentle building, not breaking down" },
      ],
      zh: [
        { text: "饭后轻松散步20-30分钟", why: "轻度运动有助于较慢的消化，不会耗伤元气" },
        { text: "太极拳或气功——缓慢、有意识的运动", why: "这些运动专门通过呼吸和控制动作来培养气" },
        { text: "避免剧烈运动——在感到疲劳前停止", why: "过度消耗会进一步耗伤元气；目标是温和积累，而非消耗" },
      ],
    },
    dailyRoutine: {
      en: ["Sleep by 10:30pm — deep rest is when Qi replenishes", "Short afternoon rest (20 min nap) if possible", "Keep warm, especially abdomen and lower back", "Avoid staying up late or overworking"],
      zh: ["22:30前入睡——深度休息是元气恢复的关键", "如有条件，午后小憩20分钟", "注意保暖，尤其是腹部和腰部", "避免熬夜或过度劳累"],
    },
    seasonal: {
      en: [
        { season: "Spring", guidance: "Your energy is rising but fragile — avoid overcommitting; gradual increase in activity" },
        { season: "Summer", guidance: "Heat and sweating deplete Qi further — stay cool, hydrate, avoid midday sun" },
        { season: "Autumn", guidance: "Good season to build reserves — focus on nourishing warm foods" },
        { season: "Winter", guidance: "Your most vulnerable season — prioritize warmth, rest, and soups" },
      ],
      zh: [
        { season: "春季", guidance: "阳气初升但仍脆弱——避免过度安排，循序渐进增加活动" },
        { season: "夏季", guidance: "炎热出汗会进一步耗气——注意防暑降温，多饮水，避开正午烈日" },
        { season: "秋季", guidance: "适合储备能量的好季节——多吃温补食物" },
        { season: "冬季", guidance: "最脆弱的季节——优先保暖、休息和喝汤" },
      ],
    },
    drinks: {
      en: ["Ginger tea with honey (warming, Qi-building)", "Red date tea (sweet, nourishing)", "Astragalus-infused warm water (classic Qi tonic)"],
      zh: ["姜茶加蜂蜜（温暖补气）", "红枣茶（甘甜滋养）", "黄芪泡水（经典补气方）"],
    },
  },
  yang_deficiency: {
    dietary: {
      en: [
        { text: "Lamb, ginger, cinnamon, and warming spices", why: "These foods have a warming nature that directly supports your deficient Yang energy" },
        { text: "Hot soups and stews as the foundation of meals", why: "Warm, cooked foods are easier to digest and help maintain internal warmth" },
        { text: "Walnuts, chestnuts, and warming nuts", why: "These nourish kidney Yang, which is the root of your constitutional pattern" },
      ],
      zh: [
        { text: "羊肉、生姜、肉桂等温性食材", why: "这些食物性温，直接补充您不足的阳气" },
        { text: "以热汤热粥为餐食基础", why: "温热熟食更容易消化，有助于维持体内温暖" },
        { text: "核桃、栗子等温性坚果", why: "这些食物滋补肾阳，而肾阳是您体质模式的根本" },
      ],
    },
    avoid: {
      en: [
        { text: "Cold and raw foods — salads, smoothies, ice cream", why: "Cold foods directly suppress your already weak Yang, making you feel colder" },
        { text: "Excessive bitter or cooling foods — bitter melon, cucumber in excess", why: "These have cooling properties that work against your warming needs" },
      ],
      zh: [
        { text: "生冷食物——沙拉、冰沙、冰淇淋", why: "冷食直接抑制本已不足的阳气，让您更怕冷" },
        { text: "过多苦味或寒凉食物——苦瓜、过量黄瓜", why: "这些食物性凉，与您需要温补的方向相反" },
      ],
    },
    activity: {
      en: [
        { text: "Exercise during the warmest part of the day (10am–2pm)", why: "Aligning activity with peak Yang energy maximizes benefit" },
        { text: "Morning sun exposure for 15-20 minutes", why: "Sunlight is a natural Yang tonic — morning sun is gentle and revitalizing" },
        { text: "Brisk walking or moderate jogging to build internal warmth", why: "Movement generates warmth and circulates Yang energy through the body" },
      ],
      zh: [
        { text: "在一天中最温暖的时段（10点-14点）运动", why: "在阳气最旺的时候运动，效果最大化" },
        { text: "早晨晒太阳15-20分钟", why: "阳光是天然的补阳方式——早晨的阳光温和而有活力" },
        { text: "快走或适度慢跑以产生体内温暖", why: "运动产生温暖，推动阳气在体内流通" },
      ],
    },
    dailyRoutine: {
      en: ["Warm foot soak before bed (38-42°C, 15 min)", "Keep feet, lower back, and abdomen warm at all times", "Dress in layers — always have extra warmth available", "Sleep early (before 10pm) to conserve Yang energy"],
      zh: ["睡前温水泡脚（38-42°C，15分钟）", "随时注意脚、腰部和腹部保暖", "穿衣分层——随时有保暖衣物", "早睡（22点前），保存阳气"],
    },
    seasonal: {
      en: [
        { season: "Spring", guidance: "Yang begins to rise — support it with gradual outdoor activity and warming foods" },
        { season: "Summer", guidance: "Your best season — take advantage of natural warmth, but don't overdo cold foods" },
        { season: "Autumn", guidance: "Start preparing for winter — increase warming foods as temperatures drop" },
        { season: "Winter", guidance: "Your most challenging season — maximize warmth, minimize cold exposure, prioritize rest" },
      ],
      zh: [
        { season: "春季", guidance: "阳气初升——通过逐步增加户外活动和温性食物来支持" },
        { season: "夏季", guidance: "您最舒适的季节——利用自然温暖，但不要贪食冷饮" },
        { season: "秋季", guidance: "开始为冬季做准备——随气温下降增加温补食物" },
        { season: "冬季", guidance: "最具挑战的季节——尽量保暖，减少受寒，优先休息" },
      ],
    },
    drinks: {
      en: ["Cinnamon bark tea (strongly warming)", "Ginger and brown sugar tea", "Warm longan and red date tea"],
      zh: ["肉桂茶（温热效果强）", "姜糖水", "桂圆红枣茶"],
    },
  },
  yin_deficiency: {
    dietary: {
      en: [
        { text: "Pears, cucumbers, and hydrating fruits/vegetables", why: "These foods are naturally moistening, replenishing the fluids your body lacks" },
        { text: "Tofu, fish, and light proteins", why: "Easily digestible proteins that nourish without generating excess heat" },
        { text: "Soups with lotus seed, lily bulb, or tremella mushroom", why: "Classic Yin-nourishing ingredients that moisten from the inside" },
      ],
      zh: [
        { text: "梨、黄瓜等滋润水果蔬菜", why: "这些食物天然滋润，补充您身体缺乏的津液" },
        { text: "豆腐、鱼等清淡蛋白质", why: "容易消化的蛋白质，滋养而不生内热" },
        { text: "莲子、百合或银耳汤", why: "经典滋阴食材，从内而外滋润" },
      ],
    },
    avoid: {
      en: [
        { text: "Spicy, fried, and heavily seasoned foods", why: "These generate internal heat, further depleting your already insufficient Yin fluids" },
        { text: "Alcohol and coffee in excess", why: "Both are drying and heating — they accelerate Yin depletion" },
      ],
      zh: [
        { text: "辛辣、油炸和重口味食物", why: "这些食物生内热，进一步消耗本已不足的阴液" },
        { text: "过量饮酒和咖啡", why: "两者都燥热——会加速阴液消耗" },
      ],
    },
    activity: {
      en: [
        { text: "Swimming, yoga, and calm activities", why: "Gentle, cooling exercises that don't overheat your body" },
        { text: "Evening walks in cool air", why: "Cool evening air naturally soothes your tendency toward warmth" },
        { text: "Avoid intense exercise that causes heavy sweating", why: "Excessive sweating depletes fluids, worsening Yin deficiency" },
      ],
      zh: [
        { text: "游泳、瑜伽等平和运动", why: "温和清凉的运动，不会让身体过热" },
        { text: "傍晚凉爽时散步", why: "凉爽的晚风自然缓解您偏热的倾向" },
        { text: "避免剧烈运动导致大量出汗", why: "过多出汗消耗津液，加重阴虚" },
      ],
    },
    dailyRoutine: {
      en: ["Sleep before 11pm — the body restores Yin fluids during deep sleep", "Stay well-hydrated throughout the day", "Calming activities before bed — reading, gentle music", "Avoid screens and stimulation close to bedtime"],
      zh: ["23点前入睡——深度睡眠时身体恢复阴液", "全天保持充足饮水", "睡前做些放松活动——阅读、轻音乐", "睡前避免屏幕和刺激性活动"],
    },
    seasonal: {
      en: [
        { season: "Spring", guidance: "Transition gently — increase hydrating foods as warmth returns" },
        { season: "Summer", guidance: "Your most challenging season — stay cool, hydrate aggressively, avoid midday heat" },
        { season: "Autumn", guidance: "Dryness amplifies your pattern — focus on moistening foods like pears and soups" },
        { season: "Winter", guidance: "Your most comfortable season — take advantage of cooler air, maintain hydration" },
      ],
      zh: [
        { season: "春季", guidance: "温和过渡——随天气回暖增加滋润食物" },
        { season: "夏季", guidance: "最具挑战的季节——注意防暑降温，大量饮水，避开正午高温" },
        { season: "秋季", guidance: "干燥会加重您的体质特点——多吃梨、汤等滋润食物" },
        { season: "冬季", guidance: "最舒适的季节——利用凉爽的空气，保持充足饮水" },
      ],
    },
    drinks: {
      en: ["Chrysanthemum and goji berry tea (cooling + nourishing)", "Pear juice with honey", "Mint tea in summer"],
      zh: ["菊花枸杞茶（清凉滋养）", "雪梨汁加蜂蜜", "夏季薄荷茶"],
    },
  },
  phlegm_dampness: {
    dietary: {
      en: [
        { text: "Barley, mung beans, and foods that reduce dampness", why: "These foods help your body process and reduce the excess dampness that defines your pattern" },
        { text: "Light steamed or stir-fried vegetables, especially leafy greens", why: "Light cooking methods don't add heaviness to your already sluggish digestion" },
        { text: "Reduce portion sizes, especially at dinner", why: "Overeating directly generates more phlegm-dampness in your body" },
      ],
      zh: [
        { text: "薏米、绿豆等祛湿食材", why: "这些食物帮助身体代谢和减少定义您体质的多余湿气" },
        { text: "清蒸或清炒蔬菜，尤其是绿叶蔬菜", why: "清淡的烹饪方式不会加重本已迟缓的消化" },
        { text: "减少食量，尤其是晚餐", why: "过食直接在体内产生更多痰湿" },
      ],
    },
    avoid: {
      en: [
        { text: "Sweet, greasy, and rich foods — pastries, fried food, heavy cream", why: "These are the primary generators of phlegm-dampness in your body" },
        { text: "Dairy in excess — milk, cheese, ice cream", why: "Dairy is considered dampness-producing and can worsen your pattern" },
        { text: "Late-night eating and midnight snacks", why: "Eating when digestion is weakest creates more dampness overnight" },
      ],
      zh: [
        { text: "甜腻、油腻和厚味食物——糕点、油炸食品、奶油", why: "这些是体内产生痰湿的主要来源" },
        { text: "过量乳制品——牛奶、奶酪、冰淇淋", why: "乳制品被认为生湿，会加重您的体质特点" },
        { text: "夜宵和深夜进食", why: "在消化最弱的时候进食会在夜间产生更多湿气" },
      ],
    },
    activity: {
      en: [
        { text: "Active cardio that promotes sweating — jogging, cycling, dancing", why: "Sweating is one of the most effective ways to expel dampness from your body" },
        { text: "Stay physically active daily, avoid long periods of sitting", why: "Stillness allows dampness to accumulate; movement keeps it circulating and clearing" },
      ],
      zh: [
        { text: "能出汗的有氧运动——慢跑、骑车、跳舞", why: "出汗是排出体内湿气最有效的方式之一" },
        { text: "每天保持身体活跃，避免久坐", why: "静止让湿气积聚；运动促进湿气流通和排出" },
      ],
    },
    dailyRoutine: {
      en: ["Keep living spaces dry and well-ventilated", "Eat regular meals, no snacking between", "Wear breathable fabrics, avoid damp clothing"],
      zh: ["保持居住环境干燥通风", "定时进餐，不吃零食", "穿透气面料，避免穿潮湿的衣物"],
    },
    seasonal: {
      en: [
        { season: "Spring", guidance: "Dampness peaks — increase barley/mung bean intake, stay active" },
        { season: "Summer", guidance: "Humid weather worsens your pattern — use dehumidifiers, avoid cold drinks" },
        { season: "Autumn", guidance: "Drier air helps — take advantage to reduce dampness through diet and exercise" },
        { season: "Winter", guidance: "Less sweating means dampness accumulates — maintain indoor exercise routine" },
      ],
      zh: [
        { season: "春季", guidance: "湿气加重——增加薏米绿豆摄入，保持活跃" },
        { season: "夏季", guidance: "潮湿天气加重体质特点——使用除湿器，避免冷饮" },
        { season: "秋季", guidance: "干燥空气有利——借机通过饮食和运动减少湿气" },
        { season: "冬季", guidance: "出汗减少导致湿气积聚——坚持室内运动" },
      ],
    },
    drinks: {
      en: ["Barley water (classic dampness-clearing)", "Pu-erh tea (warm, helps digestion)", "Corn silk tea"],
      zh: ["薏米水（经典祛湿）", "普洱茶（温和助消化）", "玉米须茶"],
    },
  },
  damp_heat: {
    dietary: {
      en: [
        { text: "Cooling foods — cucumber, watermelon, mung beans, bitter melon", why: "These naturally clear heat while draining dampness from your system" },
        { text: "Light, simply prepared meals", why: "Heavy cooking methods add more heat and dampness to your already overloaded system" },
        { text: "Include bitter greens like arugula, dandelion greens", why: "Bitter flavor clears heat — a key therapeutic direction for your pattern" },
      ],
      zh: [
        { text: "清凉食物——黄瓜、西瓜、绿豆、苦瓜", why: "这些食物天然清热利湿" },
        { text: "清淡、简单的烹饪方式", why: "厚重的烹饪方式会给本已负担过重的身体增加更多湿热" },
        { text: "加入苦味蔬菜如芝麻菜、蒲公英叶", why: "苦味清热——这是您体质调理的关键方向" },
      ],
    },
    avoid: {
      en: [
        { text: "Alcohol, especially beer and spirits", why: "Alcohol is both damp and hot — the exact combination that worsens your pattern" },
        { text: "Spicy, fried, and barbecued foods", why: "These add internal heat on top of your existing damp-heat" },
      ],
      zh: [
        { text: "酒类，尤其是啤酒和烈酒", why: "酒既生湿又生热——正是加重您体质特点的组合" },
        { text: "辛辣、油炸和烧烤食物", why: "这些食物在您本有的湿热上再添内热" },
      ],
    },
    activity: {
      en: [
        { text: "Swimming and water-based activities", why: "Water naturally cools while the exercise helps clear dampness through movement" },
        { text: "Moderate intensity — avoid overheating during exercise", why: "Too much heat generation worsens your pattern; find the balance" },
      ],
      zh: [
        { text: "游泳和水上活动", why: "水天然降温，运动同时通过活动清除湿气" },
        { text: "中等强度——运动时避免过热", why: "产生过多热量会加重您的体质特点；找到平衡" },
      ],
    },
    dailyRoutine: {
      en: ["Keep skin clean and dry — shower after sweating", "Wear breathable, natural fabrics", "Keep bedroom cool and well-ventilated at night"],
      zh: ["保持皮肤清洁干燥——出汗后及时沐浴", "穿透气天然面料的衣物", "卧室保持凉爽通风"],
    },
    seasonal: {
      en: [
        { season: "Spring", guidance: "Increasing warmth may start triggering breakouts — focus on cooling foods early" },
        { season: "Summer", guidance: "Your most challenging period — late summer damp-heat peaks; avoid spicy BBQ and alcohol" },
        { season: "Autumn", guidance: "Drier weather brings relief — maintain anti-inflammatory diet" },
        { season: "Winter", guidance: "Your most comfortable season — but don't overindulge in hot pot and rich foods" },
      ],
      zh: [
        { season: "春季", guidance: "气温上升可能开始引发皮肤问题——尽早注意清凉饮食" },
        { season: "夏季", guidance: "最具挑战的时期——夏末湿热达到高峰；避免辛辣烧烤和饮酒" },
        { season: "秋季", guidance: "干燥天气带来缓解——保持清淡饮食" },
        { season: "冬季", guidance: "最舒适的季节——但不要过度放纵火锅和厚味食物" },
      ],
    },
    drinks: {
      en: ["Green tea (cooling, antioxidant)", "Chrysanthemum tea (clears heat)", "Barley water with a squeeze of lemon"],
      zh: ["绿茶（清凉、抗氧化）", "菊花茶（清热）", "薏米水加柠檬汁"],
    },
  },
  blood_stasis: {
    dietary: {
      en: [
        { text: "Dark leafy greens, beets, and foods rich in iron and antioxidants", why: "These support blood health and circulation, addressing the root of your pattern" },
        { text: "Hawthorn berries, turmeric, and warming spices", why: "These are traditionally used to invigorate blood circulation" },
        { text: "Well-cooked, warm meals", why: "Warm food supports circulation; cold food can slow blood flow further" },
      ],
      zh: [
        { text: "深色绿叶蔬菜、甜菜根等富含铁和抗氧化物的食物", why: "这些食物支持血液健康和循环，针对您体质的根本" },
        { text: "山楂、姜黄和温性香料", why: "传统上用于活血化瘀" },
        { text: "温热熟食", why: "温热食物促进循环；冷食可能进一步减缓血液流通" },
      ],
    },
    avoid: {
      en: [
        { text: "Cold and frozen foods", why: "Cold constricts blood vessels and worsens stagnation" },
        { text: "Excessive salt and high-sodium foods", why: "These can increase blood viscosity, worsening circulation" },
      ],
      zh: [
        { text: "冷冻和生冷食物", why: "寒冷收缩血管，加重瘀滞" },
        { text: "过多盐分和高钠食物", why: "可能增加血液粘稠度，加重循环不畅" },
      ],
    },
    activity: {
      en: [
        { text: "Regular movement throughout the day — avoid prolonged sitting", why: "Stillness is the enemy of circulation; frequent movement prevents stagnation" },
        { text: "Stretching, yoga, and flexibility work", why: "These open channels and promote blood flow to stagnant areas" },
        { text: "Moderate aerobic exercise — dancing, swimming", why: "Rhythmic movement promotes steady blood circulation" },
      ],
      zh: [
        { text: "全天保持规律运动——避免久坐", why: "静止是循环的敌人；频繁运动防止瘀滞" },
        { text: "拉伸、瑜伽和柔韧性训练", why: "打通经络，促进血液流向瘀滞部位" },
        { text: "适度有氧运动——舞蹈、游泳", why: "有节奏的运动促进稳定的血液循环" },
      ],
    },
    dailyRoutine: {
      en: ["Stay warm — protect from cold wind especially in winter", "Regular sleep schedule to support blood regeneration", "Gentle self-massage on areas that feel stiff or painful"],
      zh: ["注意保暖——尤其冬天避免受寒", "规律作息以支持血液再生", "对僵硬或疼痛部位进行温和自我按摩"],
    },
    seasonal: {
      en: [
        { season: "Spring", guidance: "Blood begins to flow more freely — support with light exercise and fresh greens" },
        { season: "Summer", guidance: "Warmth naturally improves your circulation — your best season for activity" },
        { season: "Autumn", guidance: "Cooling temperatures may slow circulation — maintain warmth and movement" },
        { season: "Winter", guidance: "Cold worsens stagnation — keep warm, exercise indoors, warm soups daily" },
      ],
      zh: [
        { season: "春季", guidance: "血液开始更自由流动——配合轻运动和新鲜蔬菜" },
        { season: "夏季", guidance: "温暖天然改善循环——您最适合运动的季节" },
        { season: "秋季", guidance: "气温下降可能减缓循环——保持温暖和运动" },
        { season: "冬季", guidance: "寒冷加重瘀滞——注意保暖，室内运动，每天喝暖汤" },
      ],
    },
    drinks: {
      en: ["Rose tea (invigorates blood, calms mood)", "Hawthorn tea (promotes circulation)", "Warm turmeric milk"],
      zh: ["玫瑰花茶（活血理气）", "山楂茶（促进循环）", "温热姜黄牛奶"],
    },
  },
  qi_stagnation: {
    dietary: {
      en: [
        { text: "Aromatic, lightly flavored foods — citrus, mint, basil", why: "Aromatic foods naturally move Qi, counteracting your tendency toward stagnation" },
        { text: "Light, fresh meals rather than heavy, rich ones", why: "Heavy food slows Qi movement; lightness keeps energy flowing" },
        { text: "Citrus fruits — oranges, tangerines, grapefruit", why: "Citrus peel is a classic Qi-moving ingredient in TCM" },
      ],
      zh: [
        { text: "芳香、口味清淡的食物——柑橘、薄荷、紫苏", why: "芳香食物天然行气，对抗您气滞的倾向" },
        { text: "清淡新鲜的饮食，而非厚重油腻", why: "厚重的食物减缓气的运行；清淡保持能量流通" },
        { text: "柑橘类水果——橙子、橘子、柚子", why: "陈皮是中医经典行气药材" },
      ],
    },
    avoid: {
      en: [
        { text: "Excessive caffeine and alcohol", why: "While they seem to provide temporary relief, they worsen anxiety and emotional instability" },
        { text: "Eating while stressed or upset", why: "Emotional eating creates more stagnation — eat in a calm state" },
      ],
      zh: [
        { text: "过多咖啡因和酒精", why: "虽然暂时缓解，但会加重焦虑和情绪不稳" },
        { text: "情绪不好时进食", why: "带着情绪进食产生更多气滞——在平静状态下进食" },
      ],
    },
    activity: {
      en: [
        { text: "Activities that promote flow — dancing, hiking, jogging", why: "Dynamic, rhythmic movement breaks through Qi stagnation" },
        { text: "Group activities and social sports", why: "Social connection counteracts the isolation tendency of your pattern" },
        { text: "Deep breathing exercises and meditation", why: "Conscious breathing directly moves stagnant Qi, especially in the chest" },
      ],
      zh: [
        { text: "促进气流的活动——跳舞、爬山、慢跑", why: "动态有节奏的运动打通气滞" },
        { text: "集体活动和社交运动", why: "社交联系对抗您体质中孤立的倾向" },
        { text: "深呼吸练习和冥想", why: "有意识的呼吸直接推动停滞的气，尤其在胸部" },
      ],
    },
    dailyRoutine: {
      en: ["Express emotions — talk to friends, journal, create art", "Spend time in nature regularly", "Avoid suppressing feelings — find healthy outlets", "Aromatic bath or essential oils before bed"],
      zh: ["适当表达情绪——和朋友聊天、写日记、进行创作", "定期亲近大自然", "不要压抑感受——找到健康的情绪出口", "睡前芳香浴或精油放松"],
    },
    seasonal: {
      en: [
        { season: "Spring", guidance: "The natural season for Qi to rise and spread — get outdoors, start new activities" },
        { season: "Summer", guidance: "Warmth and social activity help — don't isolate yourself" },
        { season: "Autumn", guidance: "Falling energy can worsen melancholy — maintain social connections and exercise" },
        { season: "Winter", guidance: "Overcast weather worsens stagnation — seek light, warmth, and human connection" },
      ],
      zh: [
        { season: "春季", guidance: "气自然升发的季节——多外出，开始新活动" },
        { season: "夏季", guidance: "温暖和社交活动有帮助——不要封闭自己" },
        { season: "秋季", guidance: "下降的能量可能加重忧郁——保持社交和运动" },
        { season: "冬季", guidance: "阴天加重气滞——寻找阳光、温暖和人际联系" },
      ],
    },
    drinks: {
      en: ["Jasmine tea (aromatic, Qi-moving)", "Rose tea (soothes emotions)", "Mint and chamomile tea (calming)"],
      zh: ["茉莉花茶（芳香行气）", "玫瑰花茶（疏肝理气）", "薄荷甘菊茶（安神）"],
    },
  },
  inherited_special: {
    dietary: {
      en: [
        { text: "Simple, whole foods with minimal additives and preservatives", why: "Reducing chemical exposure decreases the triggers for your allergic tendencies" },
        { text: "Identify and track your personal food sensitivities", why: "Your constitution reacts to specific triggers — knowing them is the most powerful tool" },
        { text: "Anti-inflammatory foods — berries, fatty fish, leafy greens", why: "These help calm the overactive immune response characteristic of your pattern" },
      ],
      zh: [
        { text: "简单天然食物，少添加剂和防腐剂", why: "减少化学品接触，降低过敏倾向的触发因素" },
        { text: "找到并记录您的个人食物敏感源", why: "您的体质对特定触发因素有反应——了解它们是最有力的工具" },
        { text: "抗炎食物——浆果、深海鱼、绿叶蔬菜", why: "有助于缓解您体质特有的免疫过度反应" },
      ],
    },
    avoid: {
      en: [
        { text: "Known allergens and foods you've reacted to before", why: "Your body remembers — even mild past reactions can escalate with repeated exposure" },
        { text: "Highly processed foods with artificial colors and flavors", why: "These contain common triggers for sensitive constitutions" },
      ],
      zh: [
        { text: "已知过敏原和曾引起反应的食物", why: "身体有记忆——即使轻微的过去反应也可能随反复接触而加重" },
        { text: "含人工色素和香料的高度加工食品", why: "这些食品含有敏感体质常见的触发因素" },
      ],
    },
    activity: {
      en: [
        { text: "Exercise in clean air environments — avoid pollution and pollen peaks", why: "Environmental triggers amplify your allergic response during physical exertion" },
        { text: "Moderate, consistent exercise routine", why: "Regular moderate exercise strengthens immune regulation without overloading it" },
      ],
      zh: [
        { text: "在空气清新的环境运动——避开污染和花粉高峰", why: "运动时环境触发因素会放大过敏反应" },
        { text: "适度、规律的运动", why: "规律适度的运动增强免疫调节而不过度负担" },
      ],
    },
    dailyRoutine: {
      en: ["Use hypoallergenic skincare and household products", "Keep living spaces clean, dust-free, and well-ventilated", "Keep a symptom diary to track patterns and triggers", "Wash bedding frequently in hot water"],
      zh: ["使用低敏护肤品和家居产品", "保持居住环境清洁、无尘、通风良好", "记录症状日记，追踪规律和触发因素", "用热水勤洗床上用品"],
    },
    seasonal: {
      en: [
        { season: "Spring", guidance: "Pollen season — your highest risk period. Monitor pollen counts, keep windows closed on high days" },
        { season: "Summer", guidance: "Heat and humidity can trigger skin reactions — keep cool and dry" },
        { season: "Autumn", guidance: "Mold and ragweed peak — continue environmental precautions" },
        { season: "Winter", guidance: "Dry indoor air can trigger skin issues — use humidifiers, moisturize regularly" },
      ],
      zh: [
        { season: "春季", guidance: "花粉季节——风险最高的时期。关注花粉指数，高峰日关闭窗户" },
        { season: "夏季", guidance: "高温潮湿可能引发皮肤反应——保持凉爽干燥" },
        { season: "秋季", guidance: "霉菌和豚草达到高峰——继续注意环境防护" },
        { season: "冬季", guidance: "干燥的室内空气可能引发皮肤问题——使用加湿器，定期保湿" },
      ],
    },
    drinks: {
      en: ["Warm honey water (soothing, anti-inflammatory)", "Nettle tea (traditional antihistamine)", "Plain warm water — safest for sensitive constitutions"],
      zh: ["温蜂蜜水（舒缓、抗炎）", "荨麻茶（传统抗过敏）", "白开水——对敏感体质最安全"],
    },
  },
};

export function getPaidRecommendations(constitution: ConstitutionType): PaidRecommendations {
  return PAID_RECOMMENDATIONS[constitution];
}
