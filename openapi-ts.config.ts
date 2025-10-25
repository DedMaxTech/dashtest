import type { Config } from '@hey-api/openapi-ts'

export default {
  input: './openapi.json',
  output: './src/client',
  
  plugins: [
    {
      name: '@hey-api/client-nuxt',
      // runtimeConfigPath: './src/hey-api.ts', 
    },
  ],
}
