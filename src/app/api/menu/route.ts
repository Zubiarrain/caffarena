import { NextResponse } from 'next/server';
import { MenuItem } from '@/definitions/MenuItem';
import { google } from 'googleapis';
import dotenv from 'dotenv'
dotenv.config();

const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')

const getGoogleSheetData = async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL || "",
          private_key: PRIVATE_KEY || "", 
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'] 
    });
  
    const spreadsheetId = process.env.SPREADSHEET_ID
    console.log('busco sheets...')
    const sheets = google.sheets({ version: 'v4', auth });
    console.log('obtengo datos...')
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'menu!A:G',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return [];
    }

    const menuItems: MenuItem[] = rows.map((row: string[]) => ({
        id: row[1],
        name: row[2],
        price: parseFloat(row[3]), // Asegúrate de que los valores numéricos se conviertan correctamente
        priceHorneada: parseFloat(row[4]),
        pricePorHornear: parseFloat(row[5]),
        category: row[0] as 'pizza' | 'empanada' | 'bebida', // Cast a los valores del enum category
        image: row[6],
    }));
    console.log('devuelvo menuItems...', menuItems)
    return menuItems;
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    return [];
  }
};


export async function GET() {
  try {
    const menuItems = await getGoogleSheetData();
    console.log('route',menuItems)
    if (!menuItems) {
      return NextResponse.json({ error: 'No se obtuvo información' });
    }
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error buscando información del menú:', error);
    return NextResponse.json({ error: 'Internal Error' });
  }
}
