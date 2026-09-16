# İçerik modeli

`content_items`: dil, tür, durum, slug, başlık, özet, JSONB body/type_data, kapak, yazar, yayın tarihi ve SEO alanları. `translation_group` iki dil eşleştirir. `categories` hiyerarşiktir ve Türkçe/İngilizce ad taşır. `tags` düz listedir. İlişki tablolarında `on delete restrict` bağlı kategori/etiketin kazara silinmesini önler.

Üretim seed içeriği yoktur. Migration yalnız boş ana kategorileri kurar.
