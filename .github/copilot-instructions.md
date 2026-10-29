# Tabia Guest — layihə qaydaları

## Əsas mənbə və iş qaydası

- [README.md](../README.md) əsas mənbədir, amma hər sorğuda tam oxunmur. Tam oxu yalnız yeni chatın və ya yeni fazanın əvvəlində, README dəyişəndə və ya qərar/scope ziddiyyəti olduqda. Digər hallarda yalnız tapşırığa aid bölməni oxu; eyni chatda artıq oxunmuş və dəyişməmiş hissəni təkrar oxuma.
- Bölmə bələdçisi: qərarlar 2, menyu 4, təqdimat/idarələr 5, demo state 6, slaydlar 14, yemək demosu 15, arxitektura 16, icra planı və paketlər 17, inteqrasiyalar 20, PIN/rəy/analitika 24, MVP siyahısı Əlavə A, təhvil Əlavə B.
- Kiçik sual və ya sırf izah üçün bu təlimat kifayətdirsə README-ni açma.
- Yalnız istifadəçinin istədiyi faza/addımı icra et. Özbaşına növbəti fazaya keçmə, yeni layihə yaratma və mövcud faylları şablonla əvəz etmə.
- Son istifadəçi qərarı köhnə məhsul tövsiyəsindən üstündür; ziddiyyət olduqda README-ni uyğunlaşdır. Təsdiqlənməmiş təklifi qərar və ya planlanan funksiyanı hazır nəticə kimi göstərmə.
- Ünsiyyət Azərbaycanca, kod identifikatorları və commit mesajları ingiliscədir. Şərhlər yalnız koddan aydın olmayan səbəbi qısa izah etsin.
- Davamlı qərarları repodakı README-də saxla; müvəqqəti chat/session yaddaşını layihənin yeganə plan mənbəyinə çevirmə. İstənilmədən ayrıca dəyişiklik hesabatı Markdown faylları yaratma.

## Məhsul və məlumat sərhədləri

- Şirkət Tabia, işçi məhsul adı Tabia Guest. Tabia qrupu müştəridir; təqdimatı hazırlayan və `/admin`-i idarə edən vendor “Developer Team”-dir. UI-da vendor tərəfi “Tabia komandası” adlandırma. Verilmiş loqodan istifadə et; müştəri, komanda, qiymət, inteqrasiya və biznes nəticəsi uydurma.
- `/`: etibarlı PIN girişi, sonra 5 kart — MVP/Demo, İcra planı və İnteqrasiya, Əlavə Təkliflər, Portfoliomuz, Qiymətlər. Slayd axını kart klikindən başlayır.
- `/admin` real Tabia idarə panelidir. Slayd daxilindəki otel admin/CRM/reporting demosu ilə qarışdırma.
- Otel sifarişləri, qonaq məlumatı, MyGov/OCR, PMS, video və ödəniş lokal, açıq “Demo” etiketli simulyasiyadır. Təqdimatın PIN, müştəri rəyi və baxış analitikası isə Supabase-də realdır.
- Əlavə A-dakı 65 MVP və 30 gələcək funksiya sərhədini qoru. Əlavə Təkliflərdə səs toplanması funksiyanı avtomatik MVP-yə daxil etmir.
- Manual və autoplay eyni ortaq action-lardan istifadə etsin. Əlaqəli qonaq/admin səhnələri ortaq store-u paylaşsın; fərqli ssenarilər təcrid olunsun. Reset deterministik, timer/listener cleanup açıq olsun; remount təkbaşına cleanup deyil.
- Slayd/funksiya ID-ləri sıra nömrəsindən asılı olmasın. Rəy və analitikanı demo store-dan ayır; demo reset real rəyləri silməsin.

## Giriş və məxfilik

- Müştəri adminin verdiyi 4 rəqəmli PIN ilə, vendor admin Supabase email/parol və server allowlist ilə daxil olur. Anonim auth təkbaşına təqdimata giriş vermir.
- PIN yoxlaması, cəhd limiti, bitmə/ləğv və bütün data icazələri serverdə tətbiq olunur. RLS və təhlükəsiz sütun proyeksiyası tələb olunur; frontend flag və route guard təhlükəsizlik sərhədi deyil.
- Public rəy bütün etibarlı PIN sessiyalarına açıqdır; vendor rəyi yalnız Tabia və müəllif sessiyasına görünür. PIN/otel etiketi və daxili auth ID-lər public cavaba düşməsin.
- Son rəyçi adı brauzerdə saxlanır və dəyişdirilə bilir; yeni ad köhnə rəyləri dəyişməsin. Görünürlük və digər açıq qərarlar üçün README-ni əsas götür.
- PIN-i və server sirlərini loglama/bundle-a yazma. `service_role` və digər sirlər `VITE_` dəyişənlərinə qoyulmur; publishable key RLS-i əvəz etmir.
- Admin önizləməsi statistikaya daxil deyil. Təkrar klik/retry deduplikasiya edilsin, sessiya sayı unikal insan sayı kimi göstərilməsin. Göndərilməyən rəyə uğur bildirmə.

## Texnologiya, dizayn və yoxlama

- Hədəf stack: npm, React + JavaScript + Vite, Tailwind v4, shadcn/ui, Motion, Zustand, React Router; real təqdimat datası üçün Supabase. İstifadəçi JavaScript seçib: `.js`/`.jsx` istifadə et, TypeScript-ə keçirmə. shadcn JavaScript çıxışı ilə qurulsun (`tsx: false`). Quraşdırmadan əvvəl mövcud paket/konfiqurasiyanı yoxla, paketləri mərhələyə uyğun əlavə et, lockfile-ı saxla.
- UI işindən əvvəl [frontend-design skill](../.agents/skills/frontend-design/SKILL.md) oxu; lazım olduqda əlçatan UI Skills MCP-dən uyğun istinad götür. Kənar tövsiyə məhsul tələblərini səssiz dəyişməsin.
- Telefondakı qonaq tətbiqi README 5.4-ə uyğundur: Tabia Guest brendi, dark mode, super-app sıxlığı, çoxdilli (mətnlər lüğətdən), zəngin amma hərəkətə bağlı animasiya, lokal lisenziyalı fotolar. Təqdimat çərçivəsi sakit və açıq tonda qalır.
- Telefon və rəy formalarındakı input/fokus slayd naviqasiyasını işə salmasın. Responsive görünüş, klaviatura, fokus, reduced-motion və Azərbaycan hərflərini yoxla.
- Kod dəyişəndə mövcud build/lint və uyğun testləri çalışdır. Giriş məlumatlarını runtime yoxla; mövcud olmayan test əmrini uğurlu sayma.
- Məbləğ, dublikat, autoplay cleanup, qonaq/admin uyğunluğu və Supabase icazələrini mənalı testlərlə yoxla. UI-ni brauzerdə, RLS-i iki müştəri sessiyası və adminlə yoxla.
- Yalnız sənəd dəyişəndə mətn, keçid və scope uyğunluğunu yoxla. Yalnız faktiki dəyişdirilənləri və aparılan yoxlamaları bildir; işlədilməyən build/test barədə uğur iddiası etmə.

## graphify

For any question about this repo's architecture, structure, components, or how to add/modify/find
code, your first action should be `graphify query "<question>"` when `graphify-out/graph.json`
exists. Use `graphify path "<A>" "<B>"` for relationship questions and `graphify explain "<concept>"`
for focused-concept questions. These return a scoped subgraph, usually much smaller than the full
report or raw grep output.

Triggers: "how do I…", "where is…", "what does … do", "add/modify a <component>",
"explain the architecture", or anything that depends on how files or classes relate.

If `graphify-out/wiki/index.md` exists, use it for broad navigation. Read `graphify-out/GRAPH_REPORT.md`
only for broad architecture review or when query/path/explain do not surface enough context. Only read
source files when (a) modifying/debugging specific code, (b) the graph lacks the needed detail, or
(c) the graph is missing or stale.

Type `/graphify` in Copilot Chat to build or update the graph.
