import { Kafka, Producer, Consumer } from 'kafkajs';
import { Kafka as messages } from '../messages';
import { env } from '.';

/**
 * Kafka worker class that handles Kafka operations.
 * Provides a generic interface for Kafka operations.
 * Acts as an abstraction layer between the service layer and the Kafka client.
 */
class KafkaWorker {
	private broker: string;
	private conditions: { producer: boolean; consumer: boolean; };
	private clientId: string;
	private kafka: Kafka;
	private producer: Producer;
	private consumer: Consumer;
	private topics: string[];
	/**
	 * Creates a new Kafka worker instance for the specified collection
	 * @param broker - The name of the Prisma model (lowercase)
	 * @param clientId - The client ID for the Kafka client
	 * @param topics - The topics to subscribe to
	 */
	constructor (broker: string, clientId: string, topics: string[]) {
		this.broker = broker;
		this.conditions = { producer: false, consumer: false };
		this.clientId = clientId;
		this.kafka = new Kafka({
			clientId: this.clientId,
			brokers: [this.broker]
		});
		this.producer = this.kafka.producer();
		this.consumer = this.kafka.consumer({ groupId: env.kafkaGroupId });
		this.topics = topics;
	}
	/**
	 * Activates consumer capacity for the worker
	 */
	public async consume (callback?: (record: Record<string, any>) => Promise<void> | void) {
		for (const topic of this.topics) {
			await this.consumer
				.subscribe({
					topic,
					fromBeginning: true
				})
				.catch(error => {
					messages.error(error, `Failed to subscribe to topic: ${topic}`);
				});
		}
		await this.consumer.connect();
		this.conditions.consumer = true;
		await this.consumer.run({
			eachMessage: async ({ topic, partition, message }) => {
				const service = (topic.charAt(0).toUpperCase() + topic.slice(1)).slice(0, -1);
				try {
					const record = JSON.parse(message.value!.toString());
					await callback?.(record);
				} catch (error: any) {
					messages.error(error, `Failed to create ${service}`);
				}
			}
		});
	}
	/**
	 * Activates producer capacity for the worker
	 */
	public async produce () {
		await this.producer.connect();
		this.conditions.producer = true;
	}
	/**
	 * Sends a message to the specified topic
	 * @param record - The record to send
	 * @param topic - The topic to send to
	 */
	public async send (record: Record<string, any>, topic: string) {
		await this.producer.send({
			topic,
			messages: [
				{
					value: JSON.stringify(record)
				}
			]
		});
	}
	/**
	 * Closes the producer and consumer connections
	 */
	public close () {
		if (this.conditions.producer) this.producer.disconnect();
		if (this.conditions.consumer) this.consumer.disconnect();
		messages.close();
	}
}
export default new KafkaWorker(env.kafkaBroker, env.kafkaClientId, env.topics);
