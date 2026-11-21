# e-Сургалт вэб

React 19, Vite 8, Tailwind CSS 4, React Router ашигласан нэг хуудаст веб апп.

## Дотоод орчин

Node.js 24 LTS ашиглана. Суулгалт түгжсэн хувилбаруудыг `package-lock.json`-оос уншина.

```sh
npm ci
npm run dev
```

Вэб `http://127.0.0.1:3000` дээр ажиллана. `npm start` мөн хөгжүүлэлтийн серверийг эхлүүлнэ. Порт эзэлсэн бол `npm run dev -- --port 3001`, дотоод сүлжээнээс хандах бол `npm run dev -- --host 0.0.0.0` ашиглана.

## Тохиргоо

Өгөгдмөл серверээс өөр сервер ашиглах бол `.env.example` файлыг `.env.local` нэрээр хуулж утгуудыг тохируулна.

| Хувьсагч | Зориулалт |
| --- | --- |
| `VITE_API_BASE_URL` | REST API-ийн суурь хаяг |
| `VITE_UPLOAD_BASE_URL` | Серверийн сургалтын зураг, медиа файлын суурь хаяг |

`VITE_` хувьсагчид браузерт харагддаг. Production веб HTTPS ашигладаг бол API болон файлын хаягийг HTTPS эсвэл тухайн домэйн дээрх `/api/v1/`, `/upload/` замаар тохируулна.

## Тест ба build

```sh
npm test
npm run build
npm run preview
```

`npm run test:watch` тестийг өөрчлөлт бүрээр ажиллуулна. Build-ийн гаралт `dist/` дотор үүснэ. `npm run preview` нь уг build-ийг `http://127.0.0.1:4173` дээр дотооддоо шалгана.

## Байршуулалт

Статик серверт `dist/`-ийн агуулгыг байршуулна. React Router ашигладаг тул `/training`, `/login` зэрэг хуудсыг шууд нээхэд статик сервер тухайн аппын `index.html`-ийг буцаахаар SPA fallback тохируулна. API болон upload замуудыг тусад нь чиглүүлнэ.

Дэд замд байрлуулах бол жишээ нь `npm run build -- --base /esurgalt/` гэж build хийж, SPA fallback-ийг `/esurgalt/index.html` рүү тохируулна.
