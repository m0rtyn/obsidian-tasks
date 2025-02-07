import { verifyAll } from 'approvals/lib/Providers/Jest/JestApprovals';
import { FunctionField } from '../../../src/Query/Filter/FunctionField';
import type { Task } from '../../../src/Task';
import { groupHeadingsForTask } from '../../CustomMatchers/CustomMatchersForGrouping';
import { verifyMarkdownForDocs } from '../../TestingTools/VerifyMarkdownTable';

/** For example, 'task.due' */
type TaskPropertyName = string;

export type CustomPropertyDocsTestData = [TaskPropertyName, QueryInstructionLineAndDescription[], Task[]];

// -----------------------------------------------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------------------------------------------

function punctuateComments(comments: string[]) {
    return comments.map((comment) => {
        if ('.,:`'.includes(comment.slice(-1))) {
            return comment;
        } else {
            return comment + '.';
        }
    });
}

function formatQueryAndResultsForApproving(instruction: string, comments: string[], matchingTasks: string[]) {
    const punctuatedComments: string[] = punctuateComments(comments);
    return `
${instruction}
${punctuatedComments.join('\n')}
=>
${matchingTasks.join('\n')}
====================================================================================
`;
}

function formatQueryAndCommentsForDocs(filters: QueryInstructionLineAndDescription[]) {
    let markdown = '';
    if (filters.length === 0) {
        markdown = '';
    } else {
        for (const filter of filters) {
            const instruction = filter[0];
            const comments = filter.slice(1);
            const punctuatedComments: string[] = punctuateComments(comments);
            markdown += `- \`\`\`${instruction}\`\`\`
${punctuatedComments.map((l) => l.replace(/^( *)/, '$1    - ')).join('\n')}
`;
        }
    }
    return markdown;
}

// -----------------------------------------------------------------------------------------------------------------
// Filtering
// -----------------------------------------------------------------------------------------------------------------

export function verifyFunctionFieldFilterSamplesOnTasks(filters: QueryInstructionLineAndDescription[], tasks: Task[]) {
    if (filters.length === 0) {
        return;
    }
    verifyAll('Results of custom filters', filters, (filter) => {
        const instruction = filter[0];
        const comment = filter.slice(1);

        const filterOrErrorMessage = new FunctionField().createFilterOrErrorMessage(instruction);
        expect(filterOrErrorMessage).toBeValid();

        const filterFunction = filterOrErrorMessage.filterFunction!;
        const matchingTasks: string[] = [];
        for (const task of tasks) {
            const matches = filterFunction(task);
            if (matches) {
                matchingTasks.push(task.toFileLineString());
            }
        }
        return formatQueryAndResultsForApproving(instruction, comment, matchingTasks);
    });
}

export function verifyFunctionFieldFilterSamplesForDocs(filters: QueryInstructionLineAndDescription[]) {
    const markdown = formatQueryAndCommentsForDocs(filters);
    verifyMarkdownForDocs(markdown);
}

// -----------------------------------------------------------------------------------------------------------------
// Grouping
// -----------------------------------------------------------------------------------------------------------------

/**
 * The first value is an example Tasks query block instruction line.
 *
 * The second and subsequent values are descriptive text for the user docs, explaining the instruction line.
 * The descriptions will be written in a bullet list.
 * To indent a bullet line, put spaces before it - 4 spaces is suggested.
 * A full-stop ('.') is added to the last line of the description.
 */
export type QueryInstructionLineAndDescription = string[];

export function verifyFunctionFieldGrouperSamplesOnTasks(
    customGroups: QueryInstructionLineAndDescription[],
    tasks: Task[],
) {
    verifyAll('Results of custom groupers', customGroups, (group) => {
        const instruction = group[0];
        const comment = group.slice(1);
        const grouper = new FunctionField().createGrouperFromLine(instruction);
        const headings = groupHeadingsForTask(grouper!, tasks);
        return formatQueryAndResultsForApproving(instruction, comment, headings);
    });
}

export function verifyFunctionFieldGrouperSamplesForDocs(customGroups: QueryInstructionLineAndDescription[]) {
    const markdown = formatQueryAndCommentsForDocs(customGroups);
    verifyMarkdownForDocs(markdown);
}
