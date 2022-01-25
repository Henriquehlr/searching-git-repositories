import React, { useEffect, useState } from "react";
import { Container, Owner, Loading, BackButton, IssuesList, PageActions, FilterList } from "./styles";
import api from '../../services/api';
import { FaArrowLeft } from 'react-icons/fa'

export default function Repositorio({ match }) {

    const [repositorio, setRepositorio] = useState({});
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState([
        {state: 'all', label: 'Todas', active: true},
        {state: 'open', label: 'Abertas', active: false},
        {state: 'closed', label: 'Fechadas', active: false},
    ]);
    const [filterIndex, setFilterIndex] = useState(0)

    useEffect(() => {

        async function load() {
            const nomeRepo = decodeURIComponent(match.params.repositorio);

            const [repositorioData, issuesData] = await Promise.all([
                api.get(`/repos/${nomeRepo}`),
                api.get(`/repos/${nomeRepo}/issues`, {
                    params: {
                        state: filter.find(f => f.active).state,
                        per_page: 5
                    }
                })
            ]);

            setRepositorio(repositorioData.data);
            setIssues(issuesData.data);
            setLoading(false);

        }

        load();

    }, [match.params.repositorio])

    useEffect(() => {

        async function loadIssue(){
            const nomeRepo = decodeURIComponent(match.params.repositorio);

            const response = await api.get(`/repos/${nomeRepo}/issues`, {
                params:{
                    state: filter[filterIndex].state,
                    page,
                    per_page: 5,
                },
            });

            setIssues(response.data);
        }

        loadIssue();

    },[filterIndex, filter, match.params.repositorio, page])

    function handlePage(action){
        setPage(action === 'back' ? page - 1 : page + 1)
    }

    if (loading) {
        return (
            <Loading>
                <h1>Carregando....</h1>
            </Loading>
        )
    }

    function handleFilter(index){
        setFilterIndex(index)
    }

    return (
        <Container>
            <BackButton to="/">
                <FaArrowLeft color="#000" size={35} />
            </BackButton>

            <Owner>
                <img
                    src={repositorio.owner.avatar_url}
                    alt={repositorio.owner.login}
                />
                <h1>{repositorio.name}</h1>
                <p>{repositorio.description}</p>
            </Owner>

            <FilterList active={filterIndex}>
                {filter.map((filter, index) => (
                    <button
                        type="button"
                        key={filter.label}
                        onClick={() => handleFilter(index)}
                    >
                        {filter.label}
                    </button>
                ))}
            </FilterList>

            <IssuesList>
                {issues.map(issue => (
                    <li key={String(issue.id)}>
                        <img src={issue.user.avatar_url} alt={issue.user.login} />

                        <div>
                            <strong>
                                <a href={issue.html_url}>{issue.title}</a>

                                {issue.labels.map(label => (
                                    <span key={String(label.id)}>{label.name}</span>
                                ))}
                            </strong>

                            <p>{issue.user.login}</p>
                        </div>
                    </li>
                ))}
            </IssuesList>

            <PageActions>
                <button
                    type="Button"
                    onClick={() => handlePage('back')}
                    disabled={page < 2}
                    >
                    Voltar
                </button>
                <button
                    type="Button"
                    onClick={() => handlePage('next')}>
                    Proxima
                </button>
            </PageActions>
        </Container>
    )
}