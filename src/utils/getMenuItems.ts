import { MenuItem } from "@/definitions/MenuItem";

export async function getMenuItems() {
    try {
        const response = await fetch('/api/menu'); // Ruta de la API interna en Next.js
        if (!response.ok) {
            throw new Error('Error al buscar menu');
        }
        const data: MenuItem[] = await response.json();
        return data
    } catch (error) {
        throw new Error('Error al buscar menu');
    }
}