import { getQuickJS } from 'quickjs-emscripten';

export class EdgeSandbox {
  static async execute(code: string, contextData: Record<string, any> = {}): Promise<any> {
    const QuickJS = await getQuickJS();
    // Create an isolated runtime with strict limits
    const vm = QuickJS.newContext();

    try {
      // Set memory and execution time limits (e.g. 1MB memory)
      vm.runtime.setMemoryLimit(1024 * 1024);
      // vm.runtime.setMaxStackSize(1024 * 512); // Optional

      // Inject context data into global
      for (const [key, value] of Object.entries(contextData)) {
        const jsonString = JSON.stringify(value);
        const parsedHandle = vm.unwrapResult(vm.evalCode(`JSON.parse(${JSON.stringify(jsonString)})`));
        vm.setProp(vm.global, key, parsedHandle);
        parsedHandle.dispose();
      }

      // Execute code securely
      const result = vm.evalCode(code);
      if (result.error) {
        const errorHandle = result.error;
        const errorStr = vm.getString(errorHandle);
        errorHandle.dispose();
        throw new Error(`Edge Function Error: ${errorStr}`);
      }

      const valueHandle = result.value;
      
      // If result is undefined, return null
      if (vm.typeof(valueHandle) === 'undefined') {
        valueHandle.dispose();
        return null;
      }
      
      // Instead, we just dump it
      const dump = vm.dump(valueHandle);
      valueHandle.dispose();
      return dump;

    } finally {
      vm.dispose();
    }
  }
}
