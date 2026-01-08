module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // React rules
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unescaped-entities': 'off',
    
    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'warn',
  },
};
