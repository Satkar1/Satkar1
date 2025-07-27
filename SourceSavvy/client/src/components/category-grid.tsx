import { Card, CardContent } from "@/components/ui/card";

interface CategoryGridProps {
  onCategorySelect: (category: string) => void;
}

const categories = [
  {
    id: 'vegetables',
    name: 'Vegetables',
    color: 'bg-green-100',
    emoji: '🥬',
  },
  {
    id: 'spices',
    name: 'Spices',
    color: 'bg-orange-100',
    emoji: '🌶️',
  },
  {
    id: 'oil',
    name: 'Oil & Ghee',
    color: 'bg-yellow-100',
    emoji: '🫗',
  },
  {
    id: 'grains',
    name: 'Grains',
    color: 'bg-amber-100',
    emoji: '🌾',
  },
  {
    id: 'dairy',
    name: 'Dairy',
    color: 'bg-blue-100',
    emoji: '🥛',
  },
  {
    id: 'meat',
    name: 'Meat',
    color: 'bg-red-100',
    emoji: '🍖',
  },
  {
    id: 'fruits',
    name: 'Fruits',
    color: 'bg-pink-100',
    emoji: '🍎',
  },
  {
    id: 'snacks',
    name: 'Snacks',
    color: 'bg-purple-100',
    emoji: '🍿',
  },
];

export default function CategoryGrid({ onCategorySelect }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {categories.map((category) => (
        <div
          key={category.id}
          className="text-center cursor-pointer"
          onClick={() => onCategorySelect(category.id)}
        >
          <Card className={`${category.color} hover:shadow-md transition-shadow`}>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="text-2xl mb-2">{category.emoji}</div>
            </CardContent>
          </Card>
          <span className="text-xs font-medium outdoor-text mt-2 block">
            {category.name}
          </span>
        </div>
      ))}
    </div>
  );
}
