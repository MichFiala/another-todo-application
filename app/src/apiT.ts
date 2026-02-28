import axios from "axios";
import { ApiApi, Configuration } from "./api-client";

import { useMemo } from "react";
import { useAuthenticatedUser } from "./authHook";

const useApi = () => {
    const {
        user,
        accessToken,
        isAuthenticated,
        isLoading,
    } = useAuthenticatedUser();

    return useMemo(() => {
        const axiosInstance = axios.create();
        axiosInstance.interceptors.request.use((config) => {
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            return config;
        });

        return new ApiApi(
            new Configuration({
                basePath: process.env.REACT_APP_API_BASE_URL ?? "https://localhost:7063",
            }),
            undefined,
            axiosInstance,
        );
    }, [accessToken]);
};

export default useApi;