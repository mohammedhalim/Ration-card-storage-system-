
import { RationCard } from './types.ts';

const STORAGE_KEY = 'ration_cards_db';

export const storage = {
  getCards: (): RationCard[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveCard: (card: RationCard) => {
    const cards = storage.getCards();
    const index = cards.findIndex(c => c.id === card.id);
    if (index > -1) {
      cards[index] = card;
    } else {
      cards.push(card);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  },

  deleteCard: (id: string) => {
    const cards = storage.getCards();
    const filtered = cards.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
