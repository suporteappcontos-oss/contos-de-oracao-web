export async function convertToWebP(file: File, quality = 0.8): Promise<File> {
  // Se não for imagem, retorna o arquivo original
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Se já for webp (e quisermos pular), retorna o original
  // Mas se quiser re-comprimir, remova esse if
  if (file.type === 'image/webp') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // fallback
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file); // fallback
            }
            // Substitui a extensão original por .webp no nome do arquivo
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const newFile = new File([blob], newName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(newFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file); // Em caso de erro, devolve o original
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file); // Em caso de erro, devolve o original
    reader.readAsDataURL(file);
  });
}
