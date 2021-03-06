import { StateBehavior, StateMachineTargets } from "../statemachine";
import { Bot } from "mineflayer";

/**
 * The bot will look at the target entity.
 */
export class BehaviorLookAtEntity implements StateBehavior
{
    private readonly bot: Bot;

    readonly targets: StateMachineTargets;
    stateName: string = 'lookAtEntity';
    active: boolean = false;

    constructor(bot: Bot, targets: StateMachineTargets)
    {
        this.bot = bot;
        this.targets = targets;
    }

    update(): void
    {
        let entity = this.targets.entity;
        if (entity)
            this.bot.lookAt(entity.position.offset(0, entity.height, 0));
    }

    /**
     * Gets the distance to the target entity.
     * 
     * @returns The distance, or 0 if no target entity is assigned.
     */
    distanceToTarget(): number
    {
        let entity = this.targets.entity;
        if (!entity)
            return 0;

        return this.bot.entity.position.distanceTo(entity.position);
    }
}