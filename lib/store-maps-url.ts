/**
 * Obtiene la URL de Google Maps para una tienda específica
 * @param storeId - ID de la tienda
 * @param storeAddress - Dirección de la tienda (usada como fallback)
 * @returns URL de Google Maps
 */
export const getStoreMapUrl = (storeId: string, storeAddress: string): string => {
  // URLs específicas para tiendas con Street View personalizado
  const mapUrls: Record<string, string> = {
    djcelutecnico: "https://www.google.com/maps/place/Djcelutecnico/@5.3091793,-73.8131533,3a,75y,156.25h,105.82t/data=!3m7!1e1!3m5!1slHSlJIsSDnObsjD4hXK_UA!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-15.822523369224058%26panoid%3DlHSlJIsSDnObsjD4hXK_UA%26yaw%3D156.2514180955918!7i16384!8i8192!4m16!1m9!3m8!1s0x8e40385c7a9fe659:0x214002c0c575d2!2sCra.+7+%23+9-72,+Ubat%C3%A9,+Villa+de+San+Diego+de+Ubat%C3%A9,+Cundinamarca!3b1!8m2!3d5.309132!4d-73.813137!10e5!16s%2Fg%2F11m62rzplt!3m5!1s0x8e4039f96bfe3f27:0x32c874342d4b68da!8m2!3d5.3091399!4d-73.8131219!16s%2Fg%2F11h129n8_7?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D",
  }

  // Si existe URL específica para la tienda, usar esa
  if (mapUrls[storeId]) {
    return mapUrls[storeId]
  }

  // Fallback: buscar la dirección en Google Maps
  return `https://www.google.com/maps/search/${encodeURIComponent(storeAddress)}`
}
