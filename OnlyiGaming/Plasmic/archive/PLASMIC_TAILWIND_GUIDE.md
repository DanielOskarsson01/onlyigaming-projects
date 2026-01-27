# Plasmic + Tailwind CSS Integration Guide

## ✅ Configuration Complete

Your project is now configured to use Tailwind CSS with Plasmic. Here's what's been set up:

### 1. **plasmic.json** - Updated to use Tailwind
```json
"style": {
  "scheme": "tailwind"
}
```

### 2. **tailwind.config.ts** - Updated to include Plasmic components
```ts
content: [
  './pages/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
  './app/**/*.{ts,tsx}',
  './src/**/*.{ts,tsx}',
  './components/plasmic/**/*.{js,jsx,ts,tsx}'  // ← Added this line
]
```

## 🎨 How to Create Components with Tailwind in Plasmic Studio

### Step 1: Create New Component
1. Go to your Plasmic project
2. Click **"New Component"**
3. Name your component (e.g., "HeroSection", "Card", "Navbar")

### Step 2: Use Tailwind Classes
Instead of using CSS properties, use Tailwind classes:

#### ✅ **DO THIS** (Tailwind Classes):
```jsx
// In Plasmic Studio, add these classes to your elements:
className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
```

#### ❌ **DON'T DO THIS** (CSS Properties):
```css
/* Don't use CSS properties in Plasmic Studio */
background-color: #3B82F6;
color: white;
padding: 24px;
border-radius: 8px;
```

### Step 3: Common Tailwind Classes for Plasmic

#### **Layout & Spacing**
- `container mx-auto` - Centered container
- `px-4 py-6` - Horizontal and vertical padding
- `m-4` - Margin on all sides
- `space-y-4` - Vertical spacing between children

#### **Colors & Backgrounds**
- `bg-blue-600` - Blue background
- `text-white` - White text
- `border-gray-300` - Gray border
- `hover:bg-blue-700` - Hover state

#### **Typography**
- `text-2xl font-bold` - Large bold text
- `text-sm text-gray-600` - Small gray text
- `text-center` - Center aligned text

#### **Flexbox & Grid**
- `flex items-center justify-between` - Flexbox layout
- `grid grid-cols-3 gap-4` - 3-column grid
- `flex-1` - Flex grow

#### **Responsive Design**
- `md:flex-row` - Flex row on medium screens and up
- `lg:text-4xl` - Larger text on large screens
- `sm:hidden` - Hidden on small screens

### Step 4: Sync Your Changes
After creating/updating components in Plasmic Studio:

```bash
npx plasmic sync
```

## 📝 Example: Creating a Hero Section

### In Plasmic Studio:
1. Create a new component called "HeroSection"
2. Add a container div with: `className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center"`
3. Add a heading with: `className="text-4xl md:text-6xl font-bold text-white text-center mb-6"`
4. Add a button with: `className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"`

### After Sync:
Your component will be available at `/plasmic/HeroSection` with full Tailwind styling!

## 🔧 Troubleshooting

### If components still use CSS:
1. Make sure you're using Tailwind classes in Plasmic Studio
2. Check that your plasmic.json has `"scheme": "tailwind"`
3. Run `npx plasmic sync --force`

### If Tailwind classes don't work:
1. Verify your tailwind.config.ts includes Plasmic paths
2. Make sure Tailwind CSS is imported in your app
3. Check that the classes are valid Tailwind classes

## 🚀 Next Steps

1. **Create new components** in Plasmic Studio using Tailwind classes
2. **Sync regularly** with `npx plasmic sync`
3. **View your components** at `/plasmic/[component-name]`
4. **Customize further** by editing the generated components locally if needed

Your setup is now ready for Tailwind CSS with Plasmic! 🎉 