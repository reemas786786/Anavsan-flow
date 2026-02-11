import React from 'react';

const MyBranchesView: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-text-primary">My Branches</h1>
      <p className="mt-1 text-text-secondary">Manage your personal query branches and track changes before creating a pull request.</p>
    </div>
  );
};

export default MyBranchesView;