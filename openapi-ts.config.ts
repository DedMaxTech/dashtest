
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
