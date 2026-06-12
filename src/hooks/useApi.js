import { useState, useEffect } from 'react';
import { API_URL as API } from '../config.js';

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
            .then(data => setRoutes(Array.isArray(data) ? data : []))
            .catch(() => {});
    }, [recomendada]);

    return routes;
}

// Rotas com trackpoints para o mapa — endpoint dedicado mais leve.
export function useMapRoutes() {
    const [routes, setRoutes] = useState([]);

    useEffect(() => {
        fetch(`${API}/routes/map`)
            .then(r => r.json())
            .then(data => setRoutes(Array.isArray(data) ? data : []))
            .catch(() => {});
    }, []);

    return routes;
}

export async function fetchRoute(id) {
    const res = await fetch(`${API}/routes/${id}`);
    return res.json();
}