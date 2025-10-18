import { createClient, RedisClientType } from 'redis';
import { env } from '.';


class RedisService {
    private client: RedisClientType;
    private isConnected: boolean = false;
    constructor () {
        this.client = this.init();
    }
    init (): RedisClientType {
        this.client = createClient({
            url: env.redisUrl
        });
        this.client.on('error', (err) => {
            console.log('Redis Client Error', err);
        });
        this.connect();
        return this.client;
    }
    async connect (): Promise<boolean> {
        await this.client.connect()
            .then(() => {
                console.log('Redis Client connected');
                this.isConnected = true;
            })
            .catch((err) => {
                console.log('Redis Client Error', err);
                throw err;
            });
        return true;
    }
    async get (key: string): Promise<
        string | string[] | { [x: string]: string; } | { value: string; score: number; }[] | null> {
        const keyType = await this.client.type(key);
        switch (keyType) {
            case 'string':
                return this.client.get(key);
            case 'hash':
                return this.client.hGetAll(key);
            case 'list':
                return this.client.lRange(key, 0, -1);
            case 'set':
                return this.client.sMembers(key);
            case 'zset':
                return this.client.zRangeWithScores(key, 0, -1);
            default:
                return `Key type '${keyType}' is not supported for automatic retrieval`;
        }
    }
    async set (key: string, value: string): Promise<boolean> {
        await this.client.set(key, value)
            .then(() => {
                console.log('Redis Client set');
            })
            .catch((err) => {
                console.log('Redis Client Set Error', err);
                throw err;
            });
        return true;
    }
    async del (key: string): Promise<boolean> {
        await this.client.del(key)
            .then(() => {
                console.log('Redis Client del');
            })
            .catch((err) => {
                console.log('Redis Client Del Error', err);
                throw err;
            });
        return true;
    }
    disconnect (): void {
        try {
            this.client.destroy();
            console.log('Redis Client disconnected');
            // this.isConnected = false;
        } catch (error) {
            console.log('Redis Client Error', error);
            throw error;
        }
    }
}

export default new RedisService();