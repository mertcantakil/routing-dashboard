# Canlı Araç/Kurye Takip Paneli (Live Fleet Tracking Dashboard) Spesifikasyonu

## 1. Klasör Mimarisi
Proje aşağıdaki yapıya uygun olarak inşa edilmelidir:
- `/app`: Ana sayfa (Tüm ekranı kaplayan harita ve üzerine binen componentler)
- `/components/map`: `LiveMap.tsx` ve `CourierMarker.tsx`
- `/components/sidebar`: `LiveFeed.tsx` ve `FleetStats.tsx`
- `/components/ui`: Glassmorphism efektli temel bileşenler
- `/hooks`: `useMockSocket.ts`
- `/types`: `Courier`, `LogEvent`, `Location` interfaceleri

## 2. Mapbox 3D Harita Gereksinimleri
- `LiveMap.tsx` tam ekran (100vh, 100vw) olmalıdır.
- Stil: `mapbox://styles/mapbox/dark-v11`.
- Başlangıç durumu: `pitch: 60`, `bearing: -20`.
- 3D-buildings layer'ı (extrude layer) aktif edilmelidir.
- Marker animasyonları: Kurye konum değiştirdiğinde atlama (jump) yapmamalı, CSS `transition: all 1s linear` ile yumuşakça kaymalıdır.
- API Key yönetimi: `.env.example` içinde `NEXT_PUBLIC_MAPBOX_TOKEN` tanımlanmalıdır.

## 3. Canlı Veri Simülasyonu (useMockSocket.ts)
- New York (Manhattan) merkezli 4 adet sanal kurye oluşturulmalıdır.
- `setInterval` ile saniyede bir kurye koordinatları mantıklı bir rotada güncellenmelidir.
- Her 3-5 saniyede bir rastgele canlı aktivite logları (örn: "Order delivered by Courier A") üretilip state'e aktarılmalıdır.

## 4. UI Gereksinimleri
- Sol tarafta absolute/fixed konumlu, `backdrop-blur-md` ve `bg-black/40` sınıflarına sahip bir Sidebar tasarlanmalıdır.
- Sidebar içinde aktif kurye istatistikleri ve anlık güncellenen animasyonlu (framer-motion veya tailwind animate) bir log akışı bulunmalıdır.