import React from 'react';
import { NextPage } from 'next';
import Layout from '../components/Layout';
import Analytics from '../components/Analytics';

const AnalyticsPage: NextPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4">
        <Analytics />
      </div>
    </Layout>
  );
};

export default AnalyticsPage; 