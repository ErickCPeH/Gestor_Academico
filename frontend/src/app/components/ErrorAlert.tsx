import { AlertCircle, X } from "lucide-react";
import { Button } from "./ui/button";

interface ErrorAlertProps {
  onClose: () => void;
  message?: string;
}

export function ErrorAlert({ onClose, message }: ErrorAlertProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full border-2 border-[#DC143C]">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-[#DC143C]/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-[#DC143C]" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">
                Ocurrió un error
              </h3>
              <p className="text-sm text-[#2C2C2C]">
                {message || "Algo salió mal. Inténtalo de nuevo."}
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="flex-shrink-0 text-[#5A5A5A] hover:text-[#2C2C2C] hover:bg-[#F9F9F9]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="bg-[#F9F9F9] px-6 py-4 rounded-b-lg border-t border-[#E0E0E0]">
          <Button
            onClick={onClose}
            className="w-full bg-[#DC143C] hover:bg-[#B01030] text-white"
          >
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
}
