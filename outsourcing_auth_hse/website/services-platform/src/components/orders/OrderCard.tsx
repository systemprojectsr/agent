import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Star, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

interface Order {
  id: number;
  amount: number;
  status: string;
  payment_status: string;
  description: string;
  created_at: string;
  completed_at?: string;
  client?: {
    id: number;
    full_name: string;
    email: string;
  };
  company?: {
    id: number;
    company_name: string;
    stars: number;
  };
  card?: {
    id: number;
    title: string;
    description: string;
  };
}

interface OrderCardProps {
  order: Order;
  userType: 'client' | 'company';
  onPayOrder?: (orderId: number) => void;
  onStartOrder?: (orderId: number) => void;
  onFinishOrder?: (orderId: number) => void;
  onCancelOrder?: (orderId: number) => void;
  onCreateReview?: (orderId: number, companyId: number) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'created': return 'bg-blue-100 text-blue-800';
    case 'paid': return 'bg-green-100 text-green-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-purple-100 text-purple-800';
    case 'finished': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'created': return 'Создан';
    case 'paid': return 'Оплачен';
    case 'in_progress': return 'В работе';
    case 'completed': return 'Выполнен';
    case 'finished': return 'Завершен';
    case 'cancelled': return 'Отменен';
    default: return status;
  }
};

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  userType,
  onPayOrder,
  onStartOrder,
  onFinishOrder,
  onCancelOrder,
  onCreateReview
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderActions = () => {
    const actions = [];

    if (userType === 'client') {
      if (order.status === 'created') {
        actions.push(
          <Button
            key="pay"
            onClick={() => onPayOrder?.(order.id)}
            className="bg-green-600 hover:bg-green-700"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Оплатить ({order.amount} ₽)
          </Button>
        );
      }

      if (order.status === 'completed') {
        actions.push(
          <Button
            key="finish"
            onClick={() => onFinishOrder?.(order.id)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Принять работу
          </Button>
        );
      }

      if (order.status === 'finished' && onCreateReview) {
        actions.push(
          <Button
            key="review"
            onClick={() => onCreateReview(order.id, order.company?.id || 0)}
            variant="outline"
          >
            <Star className="w-4 h-4 mr-2" />
            Оставить отзыв
          </Button>
        );
      }

      if (order.status === 'created' || order.status === 'paid') {
        actions.push(
          <Button
            key="cancel"
            onClick={() => onCancelOrder?.(order.id)}
            variant="destructive"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Отменить
          </Button>
        );
      }
    } else if (userType === 'company') {
      if (order.status === 'paid') {
        actions.push(
          <Button
            key="start"
            onClick={() => onStartOrder?.(order.id)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Clock className="w-4 h-4 mr-2" />
            Начать работу
          </Button>
        );
      }

      if (order.status === 'created' || order.status === 'paid') {
        actions.push(
          <Button
            key="cancel"
            onClick={() => onCancelOrder?.(order.id)}
            variant="destructive"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Отменить
          </Button>
        );
      }
    }

    return actions;
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              Заказ #{order.id}
              {order.card && ` - ${order.card.title}`}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </Badge>
              <span className="text-2xl font-bold text-green-600">
                {order.amount} ₽
              </span>
            </div>
          </div>
          {userType === 'client' && order.company && (
            <div className="text-right">
              <p className="font-medium">{order.company.company_name}</p>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="ml-1">{order.company.stars.toFixed(1)}</span>
              </div>
            </div>
          )}
          {userType === 'company' && order.client && (
            <div className="text-right">
              <p className="font-medium">{order.client.full_name}</p>
              <p className="text-sm text-gray-600">{order.client.email}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {order.description && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Описание заказа:</h4>
            <p className="text-gray-700">{order.description}</p>
          </div>
        )}

        {order.card && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Услуга:</h4>
            <p className="text-gray-700">{order.card.description}</p>
          </div>
        )}

        <div className="mb-4 text-sm text-gray-600">
          <p>Создан: {formatDate(order.created_at)}</p>
          {order.completed_at && (
            <p>Выполнен: {formatDate(order.completed_at)}</p>
          )}
        </div>

        {renderActions().length > 0 && (
          <div className="flex flex-wrap gap-2">
            {renderActions()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;
