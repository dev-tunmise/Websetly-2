# Websetly - Professional Web Design Agency

A modern, responsive website for Websetly web design agency built with HTML5, Tailwind CSS, and optimized for performance and SEO.

## 🚀 Features

- **Modern Design**: Clean, professional design with smooth animations
- **Fully Responsive**: Mobile-first approach, works on all devices
- **SEO Optimized**: Complete meta tags, Open Graph, and Twitter Cards
- **Performance Optimized**: Minified CSS, optimized images, fast loading
- **Contact Form**: Integrated with Formspree for easy form handling
- **Analytics Ready**: Google Analytics integration ready

## 📁 Project Structure

```
Websetly-2/
├── css/
│   └── output.css          # Compiled Tailwind CSS
├── images/                 # All website images and assets
├── src/
│   └── input.css          # Tailwind source file
├── index.html             # Homepage
├── about.html             # About page
├── services.html          # Services page
├── portfolio.html         # Portfolio page
├── contact.html           # Contact page
├── privacy.html           # Privacy policy
├── terms.html             # Terms of service
├── package.json           # Node.js dependencies
├── tailwind.config.js     # Tailwind configuration
└── vercel.json           # Vercel deployment config
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **Tailwind CSS**: Utility-first CSS framework
- **JavaScript**: Interactive components
- **Formspree**: Form handling service
- **Google Analytics**: Website analytics
- **Vercel**: Hosting and deployment

## 📝 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Websetly-2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build CSS (production)**
   ```bash
   npm run build
   ```

4. **Watch CSS changes (development)**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Open `index.html` in your browser
   - Or use Live Server extension in VS Code

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the settings

2. **Manual Deploy**
   ```bash
   npm install -g vercel
   vercel
   ```

### Other Hosting Options

The site can be deployed to any static hosting service:
- Netlify
- GitHub Pages
- AWS S3
- Firebase Hosting

## ⚙️ Configuration

### Google Analytics
1. Get your Google Analytics tracking ID
2. Replace `YOUR_GA_TRACKING_ID` in all HTML files
3. Uncomment the analytics code in `index.html`

### Formspree Setup
1. Sign up at [formspree.io](https://formspree.io)
2. Create a new form
3. Replace `YOUR_FORMSPREE_ID` in `contact.html`

### Domain Setup
1. Update canonical URLs in all HTML files
2. Replace `https://websetly.com` with your actual domain
3. Update Open Graph and Twitter Card URLs

## 🎨 Customization

### Colors
Update colors in `tailwind.config.js`:
```javascript
colors: {
  'primary': '#0A192F',    // Dark blue
  'secondary': '#FF6B35',  // Orange
  'neutral': '#F5F5F5',    // Light gray
}
```

### Content
- Update company information in all HTML files
- Replace placeholder images in the `images/` folder
- Modify services, portfolio items, and testimonials

### Fonts
The site uses Inter font from Google Fonts. To change:
1. Update the Google Fonts link in HTML files
2. Update `fontFamily` in `tailwind.config.js`

## 📱 Responsive Design

The website is built mobile-first and includes:
- Responsive navigation with mobile menu
- Fluid typography and spacing
- Optimized images for different screen sizes
- Touch-friendly interactive elements

## 🔍 SEO Features

- **Meta Tags**: Title, description, keywords for each page
- **Open Graph**: Social media sharing optimization
- **Twitter Cards**: Twitter sharing optimization
- **Structured Data**: Ready for schema markup
- **Semantic HTML**: Proper heading hierarchy
- **Alt Text**: All images have descriptive alt text

## 📞 Support

For questions or support, contact:
- Email: awomoyitunmise@gmail.com
- Website: [websetly.com](https://websetly.com)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
