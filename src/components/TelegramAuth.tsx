import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface TelegramAuthProps {
  onAuth: (user: any) => void;
}

declare global {
  interface Window {
    TelegramLoginWidget?: {
      dataOnauth: (user: any) => void;
    };
  }
}

export default function TelegramAuth({ onAuth }: TelegramAuthProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'YOUR_BOT_USERNAME');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'window.TelegramLoginWidget.dataOnauth(user)');
    
    window.TelegramLoginWidget = {
      dataOnauth: onAuth
    };
    
    const container = document.getElementById('telegram-login-container');
    if (container) {
      container.appendChild(script);
    }
    
    return () => {
      if (container && script.parentNode) {
        container.removeChild(script);
      }
    };
  }, [onAuth]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-24 h-24 bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-3xl mx-auto mb-6 flex items-center justify-center">
          <Icon name="MapPin" size={48} className="text-white" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">МАЯК</h1>
        <p className="text-gray-600 mb-8">
          Отслеживайте дорожную обстановку<br />и помогайте другим водителям
        </p>
        
        <div id="telegram-login-container" className="mb-4 flex justify-center"></div>
        
        <p className="text-sm text-gray-500 mt-4">
          Войдите через Telegram для доступа<br />ко всем функциям приложения
        </p>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Icon name="MapPin" size={24} className="mx-auto text-[#007AFF] mb-2" />
              <p className="text-xs text-gray-600">Карта событий</p>
            </div>
            <div>
              <Icon name="Bell" size={24} className="mx-auto text-[#007AFF] mb-2" />
              <p className="text-xs text-gray-600">Уведомления</p>
            </div>
            <div>
              <Icon name="Star" size={24} className="mx-auto text-[#007AFF] mb-2" />
              <p className="text-xs text-gray-600">Рейтинг</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
