import { StateBehavior, StateMachineTargets } from "../statemachine";
import { globalSettings } from "../index";
import { Bot } from "mineflayer";
import { Movements, goals } from "mineflayer-pathfinder";
import { Vec3 } from "vec3";

/**
 * Causes the bot to move to the target position.
 * 
 * This behavior relies on the mineflayer-pathfinding plugin to be installed.
 */
export class BehaviorMoveTo implements StateBehavior
{
    private readonly bot: Bot;

    readonly targets: StateMachineTargets;
    readonly movements: Movements;
    stateName: string = 'moveTo';
    active: boolean = false;

    /**
     * How close the bot should attempt to get to this location before
     * considering the goal reached. A value of 0 will mean the bot must
     * be inside the target position.
     */
    distance: number = 0;

    constructor(bot: Bot, targets: StateMachineTargets)
    {
        this.bot = bot;
        this.targets = targets;

        const mcData = require('minecraft-data')(bot.version);
        this.movements = new Movements(bot, mcData);

        // @ts-ignore
        bot.on('path_update', (r) =>
        {
            if (r.status === 'noPath')
                console.log("[MoveTo] No path to target!");
        });

        // @ts-ignore
        bot.on('goal_reached', () =>
        {
            if (globalSettings.debugMode)
                console.log("[MoveTo] Target reached.");
        });
    }

    onStateEntered(): void
    {
        this.startMoving();
    }

    onStateExited(): void
    {
        this.stopMoving();
    }

    /**
     * Sets the target block position to move to. If the bot
     * is currently moving, it will stop and move to here instead.
     * 
     * If the bot is not currently in this behavior state, the entity
     * will still be assigned as the target position when this state
     * is entered.
     * 
     * This method updates the target position.
     * 
     * @param position - The position to move to.
     */
    setMoveTarget(position: Vec3): void
    {
        if (this.targets.position == position)
            return;

        this.targets.position = position;
        this.restart();
    }

    /**
     * Cancels the current path finding operation.
     */
    private stopMoving(): void
    {
        // @ts-ignore
        const pathfinder = this.bot.pathfinder;
        pathfinder.setGoal(null);
    }

    /**
     * Starts a new path finding operation.
     */
    private startMoving(): void
    {
        const position = this.targets.position;
        if (!position)
        {
            if (globalSettings.debugMode)
                console.log("[MoveTo] Target not defined. Skipping.");

            return;
        }

        if (globalSettings.debugMode)
            console.log("[MoveTo] Moving from " + this.bot.entity.position + " to " + position);

        // @ts-ignore
        const pathfinder = this.bot.pathfinder;

        let goal;

        if (this.distance === 0)
            goal = new goals.GoalBlock(position.x, position.y, position.z);
        else
            goal = new goals.GoalNear(position.x, position.y, position.z, this.distance);

        pathfinder.setMovements(this.movements);
        pathfinder.setGoal(goal);
    }

    /**
     * Stops and restarts this movement behavior. Does nothing if
     * this behavior is not active.
     */
    restart(): void
    {
        if (!this.active)
            return;

        this.stopMoving();
        this.startMoving();
    }

    /**
     * Checks if the bot has finished moving or not.
     */
    isFinished(): boolean
    {
        // @ts-ignore
        const pathfinder = this.bot.pathfinder;
        return !pathfinder.isMoving();
    }

    /**
     * Gets the distance to the target position.
     * 
     * @returns The distance, or 0 if no target position is assigned.
     */
    distanceToTarget(): number
    {
        let position = this.targets.position;
        if (!position)
            return 0;

        return this.bot.entity.position.distanceTo(position);
    }
}