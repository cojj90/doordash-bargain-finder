# 🛒 DoorDash Bargain Finder

A modern, internationalized dashboard for finding the best deals and discounts on DoorDash products. Built with Next.js 15, TypeScript, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-15.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🔍 **Smart Search & Filtering** - Search products by name, filter by category, price range, and discount percentage
- 📊 **Analytics Dashboard** - Visual insights with charts showing category distribution and average discounts
- 🏷️ **Deal Discovery** - Find top deals and biggest savings at a glance
- 🌍 **Internationalization** - Full support for English and Korean languages
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- ⚡ **Real-time Updates** - Instant filtering and sorting without page reloads
- 🎨 **Beautiful UI** - Modern, clean interface with smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn package manager

### Installation

1. Clone the repository:
```bash
git clone git@github.com:cojj90/doordash-bargain-finder.git
cd doordash-bargain-finder
```

2. Install dependencies:
```bash
yarn install
```

3. Add your product data:
   - Place your `products.csv` file in the `public/` directory
   - Or use the parser scripts in the parent directory to generate it from DoorDash data

4. Run the development server:
```bash
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🌐 Internationalization

The app supports multiple languages:
- 🇺🇸 English (default): `/en`
- 🇰🇷 Korean: `/ko`

Switch languages using the dropdown in the header.

## 📊 Data Format

The app expects a CSV file with the following columns:
- Category
- ID
- Name
- Price
- Original Price
- Discount %
- Currency
- Display Price
- Store ID
- Store Name
- Item MSID
- Stock Level
- Limit
- Image URL

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Tables**: TanStack Table
- **Internationalization**: next-intl
- **CSV Parsing**: PapaParse

## 📁 Project Structure

```
doordash-bargain-finder/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx    # Locale-specific layout
│   │   └── page.tsx       # Main dashboard page
│   └── globals.css        # Global styles
├── components/
│   ├── filters.tsx        # Filter sidebar component
│   ├── product-card.tsx   # Product display card
│   ├── stats-dashboard.tsx # Analytics charts
│   └── language-switcher.tsx # Language selector
├── lib/
│   ├── data.ts           # Data fetching/processing
│   ├── types.ts          # TypeScript interfaces
│   └── utils.ts          # Helper functions
├── messages/
│   ├── en.json           # English translations
│   └── ko.json           # Korean translations
├── public/
│   └── products.csv      # Product data
└── i18n.ts              # Internationalization config
```

## 🎯 Features in Detail

### Browse Products
- View all products in a grid layout
- See discount badges with color coding
- View product images, prices, and savings

### Advanced Filtering
- **Search**: Find products by name
- **Categories**: Filter by product category
- **Price Range**: Set minimum and maximum price
- **Discount**: Set minimum discount percentage
- **Purchase Limits**: Filter by products with/without limits
- **Sorting**: Sort by discount, price, savings, or name

### Analytics Dashboard
- Total products and savings statistics
- Category distribution pie chart
- Average discount by category bar chart
- Top 10 deals showcase

## 🚢 Deployment

### Vercel (Recommended)
```bash
yarn build
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start"]
```

## 📝 Scripts

- `yarn dev` - Start development server with Turbopack
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**CJ**
- GitHub: [@cojj90](https://github.com/cojj90)

---

Built with ❤️ using Next.js and TypeScript