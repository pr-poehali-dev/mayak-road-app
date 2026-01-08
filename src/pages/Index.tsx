import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type EventType = 'accident' | 'ice' | 'snow' | 'repair' | 'other';

interface RoadEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  lat: number;
  lng: number;
  distance: number;
  timestamp: Date;
  author: {
    name: string;
    avatar: string;
    rating: number;
  };
}

const mockEvents: RoadEvent[] = [
  {
    id: '1',
    type: 'accident',
    title: 'ДТП на перекрестке',
    description: 'Столкновение двух автомобилей, движение затруднено',
    lat: 55.7558,
    lng: 37.6173,
    distance: 2.3,
    timestamp: new Date(Date.now() - 15 * 60000),
    author: { name: 'Алексей М.', avatar: '', rating: 4.8 }
  },
  {
    id: '2',
    type: 'ice',
    title: 'Гололёд',
    description: 'Скользкая дорога, будьте осторожны',
    lat: 55.7520,
    lng: 37.6156,
    distance: 5.1,
    timestamp: new Date(Date.now() - 45 * 60000),
    author: { name: 'Мария С.', avatar: '', rating: 4.9 }
  },
  {
    id: '3',
    type: 'repair',
    title: 'Дорожные работы',
    description: 'Ремонт дорожного покрытия, одна полоса перекрыта',
    lat: 55.7580,
    lng: 37.6200,
    distance: 8.7,
    timestamp: new Date(Date.now() - 120 * 60000),
    author: { name: 'Дмитрий К.', avatar: '', rating: 4.6 }
  }
];

const eventConfig = {
  accident: { icon: 'AlertTriangle', label: 'ДТП', color: 'text-red-600' },
  ice: { icon: 'Snowflake', label: 'Гололёд', color: 'text-blue-500' },
  snow: { icon: 'Cloud', label: 'Снег', color: 'text-gray-400' },
  repair: { icon: 'Construction', label: 'Ремонт', color: 'text-yellow-600' },
  other: { icon: 'AlertCircle', label: 'Другое', color: 'text-gray-600' }
};

export default function Index() {
  const [activeTab, setActiveTab] = useState<'map' | 'profile'>('map');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<RoadEvent | null>(null);
  const [newEvent, setNewEvent] = useState({
    type: 'accident' as EventType,
    title: '',
    description: ''
  });

  const userProfile = {
    name: 'Иван Петров',
    avatar: '',
    rating: 4.7,
    eventsCreated: 23,
    helpfulReports: 18
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} мин назад`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;
    return `${Math.floor(hours / 24)} д назад`;
  };

  const handleCreateEvent = () => {
    console.log('Создание события:', newEvent);
    setShowCreateEvent(false);
    setNewEvent({ type: 'accident', title: '', description: '' });
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between ios-blur sticky top-0 z-50">
        <h1 className="text-xl font-semibold text-[#007AFF]">МАЯК</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <Icon name="MessageCircle" size={20} />
          </Button>
          <Avatar className="h-9 w-9 border-2 border-[#007AFF]">
            <AvatarImage src={userProfile.avatar} />
            <AvatarFallback className="bg-[#007AFF] text-white text-sm">
              {userProfile.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-20">
        {activeTab === 'map' && (
          <div className="p-4 space-y-4">
            <div className="bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm opacity-90">Радиус мониторинга</p>
                  <p className="text-3xl font-bold">59 км</p>
                </div>
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon name="MapPin" size={32} />
                </div>
              </div>
              <p className="text-sm opacity-90">События поблизости: {mockEvents.length}</p>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">События на дороге</h2>
              <Button
                onClick={() => setShowCreateEvent(true)}
                className="bg-[#007AFF] hover:bg-[#0051D5] text-white rounded-full h-10 px-6 shadow-lg bounce-in"
              >
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить
              </Button>
            </div>

            <div className="space-y-3">
              {mockEvents.map((event) => {
                const config = eventConfig[event.type];
                return (
                  <Card
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98] border-none shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className={`h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0 ${config.color}`}>
                        <Icon name={config.icon as any} size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">{event.title}</h3>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {event.distance} км
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{event.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Icon name="User" size={14} />
                            <span>{event.author.name}</span>
                            <Icon name="Star" size={14} className="ml-2 text-yellow-500" />
                            <span>{event.author.rating}</span>
                          </div>
                          <span>{formatTime(event.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-4 space-y-4">
            <Card className="p-6 border-none shadow-sm">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 border-4 border-[#007AFF] mb-4">
                  <AvatarImage src={userProfile.avatar} />
                  <AvatarFallback className="bg-[#007AFF] text-white text-2xl">
                    {userProfile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-1">{userProfile.name}</h2>
                <div className="flex items-center gap-1 text-yellow-500 mb-4">
                  <Icon name="Star" size={20} />
                  <span className="text-lg font-semibold">{userProfile.rating}</span>
                </div>
                <Button className="bg-[#007AFF] hover:bg-[#0051D5] text-white rounded-full">
                  Редактировать профиль
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 border-none shadow-sm text-center">
                <div className="text-3xl font-bold text-[#007AFF] mb-1">{userProfile.eventsCreated}</div>
                <div className="text-sm text-gray-600">Создано событий</div>
              </Card>
              <Card className="p-4 border-none shadow-sm text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{userProfile.helpfulReports}</div>
                <div className="text-sm text-gray-600">Полезных отчётов</div>
              </Card>
            </div>

            <Card className="p-4 border-none shadow-sm">
              <h3 className="font-semibold mb-3">Достижения</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-xl">
                  <div className="text-2xl">🏆</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Помощник на дороге</p>
                    <p className="text-xs text-gray-600">20+ полезных отчётов</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-xl">
                  <div className="text-2xl">⭐</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Активный участник</p>
                    <p className="text-xs text-gray-600">Рейтинг выше 4.5</p>
                  </div>
                </div>
              </div>
            </Card>

            <Button variant="outline" className="w-full rounded-xl">
              <Icon name="MessageCircle" size={18} className="mr-2" />
              Связаться с поддержкой
            </Button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 ios-blur">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
              activeTab === 'map' ? 'text-[#007AFF]' : 'text-gray-500'
            }`}
          >
            <Icon name="Map" size={24} />
            <span className="text-xs font-medium">Карта</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
              activeTab === 'profile' ? 'text-[#007AFF]' : 'text-gray-500'
            }`}
          >
            <Icon name="User" size={24} />
            <span className="text-xs font-medium">Профиль</span>
          </button>
        </div>
      </nav>

      <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Добавить событие</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Тип события</label>
              <Select value={newEvent.type} onValueChange={(value: EventType) => setNewEvent({ ...newEvent, type: value })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(eventConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon name={config.icon as any} size={16} className={config.color} />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Заголовок</label>
              <Input
                placeholder="Краткое описание"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Описание</label>
              <Textarea
                placeholder="Подробная информация о событии"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="rounded-xl resize-none"
                rows={4}
              />
            </div>
            <Button
              onClick={handleCreateEvent}
              className="w-full bg-[#007AFF] hover:bg-[#0051D5] text-white rounded-xl h-12"
            >
              Создать событие
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <div className={`h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0 ${eventConfig[selectedEvent.type].color}`}>
                    <Icon name={eventConfig[selectedEvent.type].icon as any} size={24} />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-lg">{selectedEvent.title}</DialogTitle>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {selectedEvent.distance} км от вас
                    </Badge>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-gray-700">{selectedEvent.description}</p>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedEvent.author.avatar} />
                    <AvatarFallback className="bg-[#007AFF] text-white text-sm">
                      {selectedEvent.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{selectedEvent.author.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Icon name="Star" size={12} className="text-yellow-500" />
                      <span>{selectedEvent.author.rating}</span>
                      <span className="ml-2">{formatTime(selectedEvent.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-[#007AFF] hover:bg-[#0051D5] text-white rounded-xl">
                    <Icon name="Navigation" size={18} className="mr-2" />
                    Навигация
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-xl">
                    <Icon name="ThumbsUp" size={18} className="mr-2" />
                    Полезно
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
