import React from 'react';
import { LayoutGrid, Table } from 'lucide-react';

type ViewToggleProps = {
  view: 'table' | 'card';
  onViewChange: (view: 'table' | 'card') => void;
};

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-2">
      <button
        onClick={() => onViewChange('table')}
        className={`p-2 rounded-md transition-colors duration-200 ${
          view === 'table'
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Table view"
      >
        <Table className="h-5 w-5" />
      </button>
      <button
        onClick={() => onViewChange('card')}
        className={`p-2 rounded-md transition-colors duration-200 ${
          view === 'card'
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Card view"
      >
        <LayoutGrid className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ViewToggle;