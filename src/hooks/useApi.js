import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:8000/api';

export function useDocks() {
    const [docks, setDocks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/docks`)
            .then(r => r.json())
            .then(data => { setDocks(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return { docks, loading };
}

export function useRoutes(recomendada = false) {
    const [routes, setRoutes] = useState([]);

    useEffect(() => {
        const qs = recomendada ? '?recomendada=true' : '';
        fetch(`${API}/routes${qs}`)
            .then(r => r.json())
            .then(setRoutes);
    }, [recomendada]);

    return routes;
}

export async function fetchRoute(id) {
    const res = await fetch(`${API}/routes/${id}`);
    return res.json();
}