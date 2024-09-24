import { getGoogleSheetData } from '@/utils/googleSheets';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const menuItems = await getGoogleSheetData();
    if (!menuItems) {
      return NextResponse.json({ error: 'No se obtuvo información' });
    }
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error buscando información del menú:', error);
    return NextResponse.json({ error: 'Internal Error' });
  }
}
