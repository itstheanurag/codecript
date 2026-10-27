import { useCallback, useState } from "react";
import { runSql, type SqlRunResponse } from "./engine";

interface RunnerState {
  running: boolean;
  response: SqlRunResponse | null;
}

export function useSqlRunner() {
  const [state, setState] = useState<RunnerState>({
    running: false,
    response: null,
  });

  const run = useCallback(async (sql: string) => {
    if (!sql.trim()) return;
    setState({ running: true, response: null });
    const response = await runSql(sql);
    setState({ running: false, response });
    return response;
  }, []);

  const clear = useCallback(() => {
    setState({ running: false, response: null });
  }, []);

  return { ...state, run, clear };
}
