import Icon from '@/components/ui/icon';

interface ThankYouModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ThankYouModal({ open, onClose }: ThankYouModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Закрыть"
        >
          <Icon name="X" size={20} />
        </button>

        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Icon name="CheckCircle" size={32} className="text-primary" />
        </div>

        <h2 className="text-xl font-bold text-foreground mb-3">
          Благодарим за обращение в компанию Техно-Сиб
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Менеджер свяжется с Вами в ближайшее время в часы работы.
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold hover:bg-primary/90 transition-colors"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
