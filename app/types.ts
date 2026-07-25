export interface Props {
    params: Promise<Record<any, any>>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}