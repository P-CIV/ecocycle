import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatage des nombres avec séparateurs de milliers
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

// Formatage des dates en français
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Formatage des pourcentages
export const formatPercent = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

// Formatage des kilogrammes
export const formatKg = (kg: number): string => {
  return `${formatNumber(kg)} kg`;
};

// Fonction pour exporter les données en CSV
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return;

  // Convertir les objets en lignes CSV
  const headers = Object.keys(data[0]);
  const csvContent = [
    // En-têtes
    headers.join(';'),
    // Données
    ...data.map(row => 
      headers.map(header => {
        const cell = row[header];
        // Formater les dates
        if (cell instanceof Date) {
          return formatDate(cell);
        }
        // Formater les nombres
        if (typeof cell === 'number') {
          return cell.toString().replace('.', ',');
        }
        // Échapper les chaînes contenant des points-virgules
        if (typeof cell === 'string' && cell.includes(';')) {
          return `"${cell}"`;
        }
        return cell;
      }).join(';')
    )
  ].join('\n');

  // Créer et télécharger le fichier
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${formatDate(new Date()).replace(/[/:]/g, '-')}.csv`);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
