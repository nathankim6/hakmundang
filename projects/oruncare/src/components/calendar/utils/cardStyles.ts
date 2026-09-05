
export const getCardStyle = (result?: string) => {
  switch (result) {
    case 'pass':
      return 'bg-gradient-to-r from-[#EAF5FF] to-[#F3F9FF] border-l-4 border-l-blue-500/80 shadow-sm hover:shadow-md transition-all duration-300';
    case 'fail':
      return 'bg-gradient-to-r from-[#FFF0F0] to-[#FFF6F6] border-l-4 border-l-red-500/80 shadow-sm hover:shadow-md transition-all duration-300';
    case 'absent':
      return 'bg-gradient-to-r from-[#FFF8E6] to-[#FFFDF5] border-l-4 border-l-yellow-500/80 shadow-sm hover:shadow-md transition-all duration-300';
    default:
      return 'bg-gradient-to-r from-[#F8FAFF] to-white border-l-4 border-l-gray-300 shadow-sm hover:shadow-md transition-all duration-300';
  }
};

export const getResultIcon = (result?: string) => {
  switch (result) {
    case 'pass':
      return 'text-blue-500 drop-shadow-sm';
    case 'fail':
      return 'text-blue-500 drop-shadow-sm';
    case 'absent':
      return 'text-yellow-500 drop-shadow-sm';
    default:
      return 'text-gray-400';
  }
};

export const getHomeworkBadgeStyle = (completed?: boolean) => {
  return completed
    ? 'bg-gradient-to-r from-soft-green to-soft-green/70 text-green-700 border-green-200 shadow-sm'
    : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 border-gray-200';
};

export const getLegendColor = (result?: string) => {
  switch (result) {
    case 'pass':
      return 'bg-gradient-to-r from-[#EAF5FF] to-[#F3F9FF] border-blue-500/80';
    case 'fail':
      return 'bg-gradient-to-r from-[#FFF0F0] to-[#FFF6F6] border-red-500/80';
    case 'absent':
      return 'bg-gradient-to-r from-[#FFF8E6] to-[#FFFDF5] border-yellow-500/80';
    default:
      return 'bg-gradient-to-r from-[#F8FAFF] to-white border-gray-300';
  }
};

export const getResultBadgeStyle = (result?: string) => {
  switch (result) {
    case 'pass':
      return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-200 shadow-sm';
    case 'fail':
      return 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 border-red-200 shadow-sm';
    case 'absent':
      return 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border-yellow-200 shadow-sm';
    case 'not-taken':
      return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-200';
    default:
      return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-200';
  }
};
