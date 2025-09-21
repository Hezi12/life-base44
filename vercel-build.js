#!/usr/bin/env node

/**
 * Vercel build script that handles missing environment variables gracefully
 */

import { execSync } from 'child_process';

console.log('🔧 Starting Vercel build process...');

// Set default environment variables if they don't exist
if (!process.env.VITE_ANTHROPIC_API_KEY) {
  console.log('⚠️  VITE_ANTHROPIC_API_KEY not found, using placeholder');
  process.env.VITE_ANTHROPIC_API_KEY = 'sk-placeholder-key';
}

if (!process.env.VITE_SUPABASE_URL) {
  console.log('⚠️  VITE_SUPABASE_URL not found, using placeholder');
  process.env.VITE_SUPABASE_URL = 'https://placeholder.supabase.co';
}

if (!process.env.VITE_SUPABASE_ANON_KEY) {
  console.log('⚠️  VITE_SUPABASE_ANON_KEY not found, using placeholder');
  process.env.VITE_SUPABASE_ANON_KEY = 'placeholder-key';
}

console.log('✅ Environment variables set, running build...');

try {
  // Run the actual build
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
