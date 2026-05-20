import type { I18nText } from "./lang";

export type PortfolioNavItem = {
  id: string;
  iconClass: string;
  label: I18nText;
};

export type PortfolioSkill = {
  name: string;
  percent: number;
};

export type PortfolioSkillCategory = {
  title: I18nText;
  items: PortfolioSkill[];
};

export type PortfolioTimelineItem = {
  year: I18nText | string;
  badge: I18nText | string;
  title: I18nText | string;
  company: string;
  description: I18nText | string;
  achievements: Array<I18nText | string>;
  tags: string[];
};

export type PortfolioProjectCard = {
  title: I18nText | string;
  description: I18nText | string;
  tags: string[];
  placeholderIconClass: string;
};

export type PortfolioContactItem = {
  iconClass: string;
  label: I18nText;
  value: string;
  href?: string;
};

export type PortfolioContent = {
  nav: PortfolioNavItem[];
  hero: {
    greeting: I18nText;
    title: I18nText;
    description: I18nText;
    ctaPrimary: I18nText;
    ctaSecondary: I18nText;
  };
  about: {
    title: I18nText;
    intro: I18nText;
    tags: Array<{
      text: I18nText;
    }>;
  };
  skills: {
    title: I18nText;
    categories: PortfolioSkillCategory[];
  };
  experience: {
    title: I18nText;
    items: PortfolioTimelineItem[];
  };
  projects: {
    title: I18nText;
    cards: PortfolioProjectCard[];
  };
  contact: {
    title: I18nText;
    items: PortfolioContactItem[];
    form: {
      placeholders: {
        name: I18nText;
        email: I18nText;
        subject: I18nText;
        message: I18nText;
      };
      submit: I18nText;
      successMessage: I18nText;
    };
  };
  footer: {
    copyright: string;
    builtWith: I18nText;
    by: I18nText;
    authorName: string;
  };
};

export const portfolioContent: PortfolioContent = {
  nav: [
    { id: "home", iconClass: "home", label: { zh: "首页", en: "Home" } },
    { id: "about", iconClass: "rocket", label: { zh: "关于我", en: "About" } },
    { id: "skills", iconClass: "tasks", label: { zh: "技能", en: "Skills" } },
    { id: "experience", iconClass: "user", label: { zh: "科研", en: "Research" } },
    { id: "projects", iconClass: "code", label: { zh: "项目", en: "Projects" } },
    { id: "contact", iconClass: "mail", label: { zh: "联系", en: "Contact" } }
  ],
  hero: {
    greeting: { zh: "你好，我是", en: "Hello, I'm" },
    title: { zh: "全栈开发者 · 转 Agent 开发", en: "Full-Stack Developer · Agent Development" },
    description: {
      zh: "喜欢捣鼓新鲜东西，专注于开发网站、设计作品，积极有活力。",
      en: "I love tinkering with new things, focusing on building websites and designing creative works. Energetic and proactive."
    },
    ctaPrimary: { zh: "查看作品", en: "View Works" },
    ctaSecondary: { zh: "联系我", en: "Contact Me" }
  },
  about: {
    title: { zh: "关于我", en: "About Me" },
    intro: {
      zh: "（自我介绍待填写）",
      en: "(Intro to be filled)"
    },
    tags: [
      { text: { zh: "完成项目 10+", en: "10+ Projects" } },
      { text: { zh: "班长", en: "Class President" } },
      { text: { zh: "发展对象", en: "Party Candidate" } },
      { text: { zh: "已过四级", en: "CET-4 Certified" } }
    ]
  },
  skills: {
    title: { zh: "学习进度", en: "Your Progress" },
    categories: [
      {
        title: { zh: "编程基础", en: "Programming Basics" },
        items: [
          { name: "Scratch 创意编程", percent: 100 },
          { name: "Python 入门", percent: 75 },
          { name: "HTML & CSS 基础", percent: 90 },
          { name: "JavaScript 入门", percent: 60 }
        ]
      },
      {
        title: { zh: "进阶技能", en: "Advanced Skills" },
        items: [
          { name: "React 前端开发", percent: 45 },
          { name: "Node.js 后端", percent: 30 },
          { name: "数据库基础", percent: 55 },
          { name: "Git 版本控制", percent: 80 }
        ]
      },
      {
        title: { zh: "创意工坊", en: "Creative Workshop" },
        items: [
          { name: "游戏设计入门", percent: 70 },
          { name: "UI/UX 设计", percent: 40 },
          { name: "3D 建模基础", percent: 25 },
          { name: "动画与故事板", percent: 65 }
        ]
      }
    ]
  },
  experience: {
    title: { zh: "科研", en: "Research" },
    items: [
      {
        year: { zh: "学习 6 个月", en: "6 Months Learning" },
        badge: { zh: "明星学员", en: "Star Student" },
        title: { zh: "从零到发布自己的 App！", en: "From Zero to Publishing My Own App!" },
        company: "小明 · 14岁 · Python 与 Web 开发 track",
        description: {
          zh: "\"FunLearn 完全改变了我对编程的看法！课程像玩游戏一样有趣，每完成一个挑战都有满满的成就感。最棒的是老师总是及时回答我的问题，让我从不会写代码到现在能独立做出一个完整的网站。\"",
          en: "\"FunLearn completely changed how I see coding! The courses feel like playing a game, and every challenge completed gives me a real sense of achievement. Best part is the mentors always answer my questions quickly. I went from zero coding knowledge to building a full website on my own!\""
        },
        achievements: [
          { zh: "完成 42 个编程挑战", en: "Completed 42 coding challenges" },
          { zh: "发布个人作品集网站", en: "Published personal portfolio site" },
          { zh: "获得 Python 初级认证", en: "Earned Python Beginner Certificate" }
        ],
        tags: ["Python", "HTML/CSS", "JavaScript", "创意项目"]
      },
      {
        year: { zh: "学习 3 个月", en: "3 Months Learning" },
        badge: "",
        title: { zh: "找到了一群志同道合的编程小伙伴", en: "Found a Community of Fellow Young Coders" },
        company: "小红 · 12岁 · Scratch 与游戏设计 track",
        description: {
          zh: "\"我最喜欢的是周末的编程小比赛和作品展示环节！能看到其他同学做出来的项目超酷的，也激励我不断尝试新的东西。现在我已经做了 5 个小游戏，还教我的朋友一起学编程呢！\"",
          en: "\"My favorite part is the weekend coding contests and project showcases! Seeing what other students build is super cool and motivates me to keep trying new things. I've already made 5 mini-games and even started teaching my friends how to code!\""
        },
        achievements: [
          { zh: "创作 5 个 Scratch 游戏", en: "Created 5 Scratch games" },
          { zh: "周末编程赛冠军 ×2", en: "Weekend Code-Off Winner ×2" },
          { zh: "邀请 3 位好友加入", en: "Invited 3 friends to join" }
        ],
        tags: ["Scratch", "游戏设计", "动画", "创意写作"]
      },
      {
        year: { zh: "学习 1 年", en: "1 Year Learning" },
        badge: "",
        title: { zh: "编程让我的数学成绩也提高了", en: "Coding Also Improved My Math Grades" },
        company: "小华 · 15岁 · AI 探索 track",
        description: {
          zh: "\"一开始我只是对 AI 感到好奇，没想到学习过程中我的逻辑思维和数学能力都变强了。平台上的机器学习入门课程用非常直观的方式解释复杂概念，让我对科技的未来充满期待。现在我正在做自己的第一个 AI 项目！\"",
          en: "\"I started just curious about AI, but I didn't expect my logical thinking and math skills to improve so much along the way. The intro ML courses explain complex concepts in really intuitive ways. I'm so excited about the future of tech — and I'm working on my first AI project right now!\""
        },
        achievements: [
          { zh: "数学成绩提升 20%", en: "Math scores improved by 20%" },
          { zh: "完成 AI 入门课程", en: "Completed AI fundamentals" },
          { zh: "获校科技展一等奖", en: "Won school science fair 1st prize" }
        ],
        tags: ["Python", "AI/ML", "数据分析", "数学"]
      }
    ]
  },
  projects: {
    title: { zh: "项目", en: "Projects" },
    cards: [
      {
        title: { zh: "仿 OS 系统", en: "OS Simulator" },
        description: {
          zh: "仿操作系统界面的 Web 应用，模拟桌面、窗口管理、文件系统等交互体验。",
          en: "A web-based OS interface simulator with desktop, window management, and file system interactions."
        },
        tags: ["React", "TypeScript", "CSS"],
        placeholderIconClass: "monitor"
      },
      {
        title: { zh: "星云短链", en: "Nebula Short Link" },
        description: {
          zh: "高性能短链接生成与管理平台，支持自定义短码、访问统计和链接过期策略。",
          en: "A high-performance URL shortener with custom codes, visit analytics, and link expiration."
        },
        tags: ["Node.js", "MongoDB", "Redis"],
        placeholderIconClass: "link"
      },
      {
        title: { zh: "看番网站", en: "Anime Streaming" },
        description: {
          zh: "在线动漫视频播放网站，支持番剧检索、分类浏览、播放进度记录等功能。",
          en: "An online anime streaming site with search, category browsing, and watch progress tracking."
        },
        tags: ["React", "Video.js", "API"],
        placeholderIconClass: "play"
      }
    ]
  },
  contact: {
    title: { zh: "联系我", en: "Contact Me" },
    items: [
      {
        iconClass: "mail",
        label: { zh: "邮箱", en: "Email" },
        value: "xuchenhui0719@gmail.com",
        href: "mailto:xuchenhui0719@gmail.com"
      },
      {
        iconClass: "phone",
        label: { zh: "电话", en: "Phone" },
        value: "19817017693",
        href: "tel:19817017693"
      },
      {
        iconClass: "map-pin",
        label: { zh: "地址", en: "Location" },
        value: "Changchun, China"
      }
    ],
    form: {
      placeholders: {
        name: { zh: "你的姓名", en: "Your Name" },
        email: { zh: "你的邮箱", en: "Your Email" },
        subject: { zh: "主题", en: "Subject" },
        message: { zh: "留言内容", en: "Message" }
      },
      submit: { zh: "发送消息", en: "Send Message" },
      successMessage: { zh: "消息已发送！我会尽快回复。", en: "Message sent! I'll get back to you soon." }
    }
  },
  footer: {
    copyright: "2025 Bian",
    builtWith: { zh: "用心与科技打造", en: "Built with love and tech" },
    by: { zh: "作者", en: "by" },
    authorName: "Bian"
  }
};
