import { useEffect, useRef } from 'react';
import { YMaps, Map, Placemark } from 'react-yandex-maps';
import { RoadEvent } from '@/lib/api';

interface YandexMapProps {
  events: RoadEvent[];
  center: [number, number];
  onEventClick: (event: RoadEvent) => void;
}

const eventColors = {
  accident: '#EF4444',
  ice: '#3B82F6',
  snow: '#9CA3AF',
  repair: '#F59E0B',
  other: '#6B7280'
};

export default function YandexMap({ events, center, onEventClick }: YandexMapProps) {
  const mapRef = useRef<any>(null);

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-lg">
      <YMaps query={{ apikey: 'YOUR_API_KEY', lang: 'ru_RU' }}>
        <Map
          defaultState={{
            center,
            zoom: 12
          }}
          width="100%"
          height="100%"
          instanceRef={mapRef}
          modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
        >
          <Placemark
            geometry={center}
            options={{
              preset: 'islands#blueCircleDotIcon',
              iconColor: '#007AFF'
            }}
          />
          
          {events.map((event) => (
            <Placemark
              key={event.id}
              geometry={[event.latitude, event.longitude]}
              properties={{
                balloonContentHeader: event.title,
                balloonContentBody: event.description,
                hintContent: event.title
              }}
              options={{
                preset: 'islands#circleIcon',
                iconColor: eventColors[event.type]
              }}
              onClick={() => onEventClick(event)}
            />
          ))}
        </Map>
      </YMaps>
    </div>
  );
}
