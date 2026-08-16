// src/styles/theme.js
export const themes = {
  light: {
    // بناءً على لوحة ألوان الباستيل الحالمة: الخوخي، الوردي، الأرجواني، والأزرق الجليدي الناعم
    background: '#BFDEF3',      // الخلفية الأساسية (Baby Blue / Ice Blue) تمنح شعوراً بالخفة والاتساع
    surface: '#FFFFFF',         // الأسطح والبطاقات بيضاء صافية لتبرز بنقاء فوق الخلفية الباستيلية
    primary: '#E0B7F4',         // الأرجواني الفاتح (Light Lavender) كلون أساسي تفاعلي ساحر ومميز
    primaryDark: '#B98AD1',     // درجة أعمق من الأرجواني للـ Hover والضغط لضمان التباين الاستجابي
    secondary: '#F2B5E1',       // الوردي الناعم (Soft Candy Pink) للمسات الجمالية، الأيقونات، والخلفيات الرقيقة
    tertiary: '#FFC9B4',        // الخوخي الدافئ (Soft Peach) لإضافة توازن لوني دافئ في عناصر معينة
    text: '#1E2B38',            // كحلي داكن عميق مشتق من روح الأزرق لتباين مثالي وقراءة مريحة جداً دون حدة الأسود
    textMuted: '#5C748C',       // النصوص الثانوية المتناسقة مع درجات الأزرق والأرجواني
    textLight: '#9ABBD6',       // نصوص خفيفة جداً وتلميحات المدخلات (Placeholders)
    border: '#B9E9E9',          // حدود ناعمة بلون التيفاني المهدئ (Pale Mint) للفصل بين الكائنات بنعومة
    error: '#FF4757',           
    warning: '#FF9F43',         
    success: '#6BD4C8',         // أخضر تيفاني معدل ليتناسب مع الطبيعة الباستيلية للثيم
    info: '#BFDEF3',            
    shadow: 'rgba(191, 222, 243, 0.25)', // ظلال ناعمة للغاية بلون الأزرق الجليدي لعمق خفيف وحالم
    // الشعار المخصص للوضع الفاتح
    logo: require('../assets/logo-light.jpg'), 
  },
  dark: {
    // الوضع الليلي الفخم القائم على البنفسجي العميق والأزرق الليلي (بدون تغيير)
    background: '#080B38',      
    surface: '#133155',         
    primary: '#522377',         
    primaryDark: '#36195B',     
    secondary: '#254D70',       
    tertiary: '#34D399',        
    text: '#FFFFFF',            
    textMuted: '#A3B3CC',       
    textLight: '#6B7C96',       
    border: '#254D70',          
    error: '#EF4444',           
    warning: '#FBBF24',         
    success: '#34D399',         
    info: '#60A5FA',            
    shadow: 'rgba(82, 35, 119, 0.4)', 
    logo: require('../assets/logo-dark.jpg'), 
  }
};

export const gradients = {
  // تدرج باستيلي ساحر يدمج الأرجواني الفاتح مع الوردي الناعم ليحاكي ألوان الريش الأصلية
  primaryLight: 'linear-gradient(135deg, #E0B7F4 0%, #F2B5E1 100%)',
  // تدرج ليلى ساحر يربط بين البنفسجي الملكي والأزرق الليلي للوضع المظلم
  primaryDark: 'linear-gradient(135deg, #522377 0%, #080B38 100%)', 
  success: 'linear-gradient(135deg, #B9E9E9 0%, #6BD4C8 100%)',
  purple: 'linear-gradient(135deg, #E0B7F4 0%, #B98AD1 100%)', 
  blueNight: 'linear-gradient(135deg, #133155 0%, #080B38 100%)',
  // تدرج إضافي يمثل خلفية الصورة الأصلية (الربط بين الأزرق الجليدي والخوخي الدافئ)
  pastelDream: 'linear-gradient(135deg, #BFDEF3 0%, #FFC9B4 100%)'
};

export const typography = {
  fontFamily: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  fontSize: {
    xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem',
  },
  fontWeight: {
    normal: '400', medium: '500', semibold: '600', bold: '700',
  },
};

export const spacing = {
  0: '0', 1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem', 8: '2rem',
};