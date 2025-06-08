import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  companyName: string;
  orderId: number;
  companyId: number;
  onSubmit: (rating: number, comment: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  companyName,
  orderId,
  companyId,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit(rating, comment);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={starValue}
          type="button"
          className={`p-1 transition-colors ${
            isFilled ? 'text-yellow-400' : 'text-gray-300'
          }`}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(starValue)}
        >
          <Star className={`w-8 h-8 ${isFilled ? 'fill-current' : ''}`} />
        </button>
      );
    });
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Очень плохо';
      case 2: return 'Плохо';
      case 3: return 'Удовлетворительно';
      case 4: return 'Хорошо';
      case 5: return 'Отлично';
      default: return 'Поставьте оценку';
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Отзыв о работе</CardTitle>
        <p className="text-gray-600">
          Компания: <span className="font-medium">{companyName}</span>
        </p>
        <p className="text-sm text-gray-500">Заказ #{orderId}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Рейтинг */}
          <div>
            <Label className="text-base font-medium">Оценка работы</Label>
            <div className="flex items-center gap-1 mt-2">
              {renderStars()}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {getRatingText(hoveredRating || rating)}
            </p>
          </div>

          {/* Комментарий */}
          <div>
            <Label htmlFor="comment" className="text-base font-medium">
              Комментарий (необязательно)
            </Label>
            <Textarea
              id="comment"
              placeholder="Расскажите подробнее о качестве выполненной работы..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2 min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 символов
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={rating === 0 || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Отправка...' : 'Отправить отзыв'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Отмена
            </Button>
          </div>
        </form>

        {/* Подсказка */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Ваш отзыв поможет другим клиентам выбрать надежного исполнителя, 
            а компании — улучшить качество услуг.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
