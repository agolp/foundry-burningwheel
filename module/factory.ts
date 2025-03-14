import { BWCharacter } from './actors/BWCharacter';
import { Armor } from './items/armor';
import { Belief } from './items/belief';
import { Instinct } from './items/instinct';
import { MeleeWeapon } from './items/meleeWeapon';
import { Possession } from './items/possession';
import { Property } from './items/property';
import { RangedWeapon } from './items/rangedWeapon';
import { Relationship } from './items/relationship';
import { Reputation } from './items/reputation';
import { Skill } from './items/skill';
import { Spell } from './items/spell';
import { Trait } from './items/trait';
import { Npc } from './actors/Npc';
import { Lifepath } from './items/lifepath';
import { BWSetting } from './actors/BWSetting';
import { Affiliation } from './items/affiliation';
import { TypeMissing } from '../types/index';

function factory(
    entities: Record<string, typeof FoundryDocument>,
    baseClass: typeof FoundryDocument
): typeof FoundryDocument {
    return new Proxy(baseClass, {
        construct: (target, args) => {
            const [data, options] = args;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const constructor = entities[data.type] as any;
            if (!constructor) {
                throw new Error(
                    'Unsupported Document type for create(): ' + data.type
                );
            }
            return new constructor(data, options);
        },
        get: (target, prop) => {
            switch (prop) {
                case 'create':
                    //Calling the class' create() static function
                    return function (
                        data: FoundryDocument.Data,
                        options: unknown
                    ) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const constructor = entities[data.type] as any;

                        if (!constructor) {
                            throw new Error(
                                'Unsupported Entity type for create(): ' +
                                    data.type
                            );
                        }
                        return constructor.create(data, options as never);
                    };

                case Symbol.hasInstance:
                    //Applying the "instanceof" operator on the instance object
                    return function (instance: FoundryDocument) {
                        const constr = entities[(instance as TypeMissing).type];
                        if (!constr) {
                            return false;
                        }
                        return instance instanceof constr;
                    };
                default:
                    //Just forward any requested properties to the base Actor class
                    return baseClass[prop];
            }
        },
    });
}

const actorTypes: Record<string, typeof FoundryDocument> = {};
actorTypes['character'] = BWCharacter as typeof FoundryDocument;
actorTypes['npc'] = Npc as typeof FoundryDocument;
actorTypes['setting'] = BWSetting as typeof FoundryDocument;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const actorConstructor = factory(
    actorTypes,
    Actor as any
) as typeof Actor;

const itemTypes: Record<string, typeof FoundryDocument> = {};

itemTypes['belief'] = Belief as typeof FoundryDocument;
itemTypes['instinct'] = Instinct as typeof FoundryDocument;
itemTypes['trait'] = Trait as typeof FoundryDocument;
itemTypes['skill'] = Skill as typeof FoundryDocument;
itemTypes['armor'] = Armor as typeof FoundryDocument;
itemTypes['possession'] = Possession as typeof FoundryDocument;
itemTypes['property'] = Property as typeof FoundryDocument;
itemTypes['relationship'] = Relationship as typeof FoundryDocument;
itemTypes['melee weapon'] = MeleeWeapon as typeof FoundryDocument;
itemTypes['ranged weapon'] = RangedWeapon as typeof FoundryDocument;
itemTypes['reputation'] = Reputation as typeof FoundryDocument;
itemTypes['affiliation'] = Affiliation as typeof FoundryDocument;
itemTypes['spell'] = Spell as typeof FoundryDocument;
itemTypes['lifepath'] = Lifepath as typeof FoundryDocument;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const itemConstructor = factory(itemTypes, Item as any) as typeof Item;
