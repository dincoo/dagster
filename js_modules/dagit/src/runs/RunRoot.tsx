import * as React from "react";

import { RouteComponentProps } from "react-router";
import { useApolloClient, useQuery } from "react-apollo";

import { IconNames } from "@blueprintjs/icons";
import { NonIdealState } from "@blueprintjs/core";
import { Run } from "./Run";
import { RunRootQuery } from "./types/RunRootQuery";
import gql from "graphql-tag";
import { AssetsSupported } from "../AssetsSupported";

export const RunRoot: React.FunctionComponent<RouteComponentProps<{
  runId: string;
  pipelineName?: string;
}>> = props => <RunById runId={props.match.params.runId} />;

export const RunById: React.FunctionComponent<{
  runId: string;
}> = ({ runId }) => {
  const client = useApolloClient();
  const { data } = useQuery<RunRootQuery>(RUN_ROOT_QUERY, {
    fetchPolicy: "cache-and-network",
    partialRefetch: true,
    variables: { runId }
  });

  if (!data || !data.pipelineRunOrError) {
    return <Run client={client} run={undefined} runId={runId} />;
  }

  if (data.pipelineRunOrError.__typename !== "PipelineRun") {
    return (
      <NonIdealState
        icon={IconNames.SEND_TO_GRAPH}
        title="No Run"
        description={"The run with this ID does not exist or has been cleaned up."}
      />
    );
  }

  return (
    <AssetsSupported.Provider value={!!data.instance?.assetsSupported}>
      <Run client={client} run={data.pipelineRunOrError} runId={runId} />
    </AssetsSupported.Provider>
  );
};

export const RUN_ROOT_QUERY = gql`
  query RunRootQuery($runId: ID!) {
    pipelineRunOrError(runId: $runId) {
      __typename
      ... on PipelineRun {
        pipeline {
          __typename
          ... on PipelineReference {
            name
            solidSelection
          }
        }
        ...RunFragment
      }
    }
    instance {
      assetsSupported
    }
  }

  ${Run.fragments.RunFragment}
`;
